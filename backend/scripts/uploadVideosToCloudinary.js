const https = require('https');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

// Optional Cloudinary script. Disabled by default for local-school mode.
if (process.env.CLOUDINARY_ENABLED !== 'true') {
  console.error('Cloudinary upload script is disabled. Set CLOUDINARY_ENABLED=true to run it intentionally.');
  process.exit(1);
}

const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.CLOUDINARY_UPLOAD_PRESET || 'ml_default';

if (!CLOUD_NAME) {
  console.error('CLOUDINARY_CLOUD_NAME is required.');
  process.exit(1);
}

// Video files to upload
const videos = [
  {
    name: 'Square Root',
    topic: 'वर्गमूल',
    fileName: 'square_root.mp4',
    filePath: path.join(__dirname, '../../public/videos/square_root.mp4')
  },
  {
    name: 'Cube Root',
    topic: 'घनमूल',
    fileName: 'cube_root.mp4',
    filePath: path.join(__dirname, '../../public/videos/cube_root.mp4')
  },
  {
    name: 'Percentage',
    topic: 'प्रतिशत',
    fileName: 'percentage.mp4',
    filePath: path.join(__dirname, '../../public/videos/percentage.mp4')
  },
  {
    name: 'Surds & Indices',
    topic: 'करणी और घातांक',
    fileName: 'surds_indices.mp4',
    filePath: path.join(__dirname, '../../public/videos/surds_indices.mp4')
  }
];

// Function to upload a single video to Cloudinary
function uploadToCloudinary(videoPath, videoName) {
  return new Promise((resolve, reject) => {
    console.log(`\n📤 Uploading: ${videoName}...`);
    console.log(`   File: ${path.basename(videoPath)}`);
    
    // Check if file exists
    if (!fs.existsSync(videoPath)) {
      reject(new Error(`File not found: ${videoPath}`));
      return;
    }

    const fileStats = fs.statSync(videoPath);
    const fileSizeMB = (fileStats.size / (1024 * 1024)).toFixed(2);
    console.log(`   Size: ${fileSizeMB} MB`);

    const form = new FormData();
    form.append('file', fs.createReadStream(videoPath));
    form.append('upload_preset', UPLOAD_PRESET);
    form.append('resource_type', 'video');
    form.append('folder', 'nmms_math_videos');

    const options = {
      hostname: 'api.cloudinary.com',
      path: `/v1_1/${CLOUD_NAME}/video/upload`,
      method: 'POST',
      headers: form.getHeaders()
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (res.statusCode === 200) {
            console.log(`   ✅ Upload successful!`);
            console.log(`   🔗 URL: ${response.secure_url}`);
            resolve({
              videoName,
              url: response.secure_url,
              publicId: response.public_id,
              duration: response.duration,
              format: response.format
            });
          } else {
            console.log(`   ❌ Upload failed: ${response.error?.message || 'Unknown error'}`);
            reject(new Error(response.error?.message || `Upload failed with status ${res.statusCode}`));
          }
        } catch (error) {
          reject(new Error(`Failed to parse response: ${error.message}`));
        }
      });
    });

    req.on('error', (error) => {
      console.log(`   ❌ Request error: ${error.message}`);
      reject(error);
    });

    // Track upload progress
    let uploadedBytes = 0;
    form.on('data', (chunk) => {
      uploadedBytes += chunk.length;
      const progress = ((uploadedBytes / fileStats.size) * 100).toFixed(1);
      process.stdout.write(`\r   Progress: ${progress}%`);
    });

    form.pipe(req);
  });
}

// Main function to upload all videos
async function uploadAllVideos() {
  console.log('🎬 Starting video upload to Cloudinary...');
  console.log('=' .repeat(70));
  console.log(`Cloud Name: ${CLOUD_NAME}`);
  console.log(`Upload Preset: ${UPLOAD_PRESET}`);
  console.log(`Total Videos: ${videos.length}`);
  console.log('=' .repeat(70));

  const results = [];
  
  for (const video of videos) {
    try {
      const result = await uploadToCloudinary(video.filePath, video.name);
      results.push({
        ...result,
        topic: video.topic
      });
    } catch (error) {
      console.error(`\n❌ Failed to upload ${video.name}:`, error.message);
      results.push({
        videoName: video.name,
        topic: video.topic,
        error: error.message
      });
    }
  }

  // Display final summary
  console.log('\n\n' + '=' .repeat(70));
  console.log('📊 UPLOAD SUMMARY');
  console.log('=' .repeat(70));

  results.forEach((result, index) => {
    console.log(`\n${index + 1}. ${result.videoName} (${result.topic})`);
    if (result.url) {
      console.log(`   ✅ Success`);
      console.log(`   🔗 URL: ${result.url}`);
      console.log(`   ⏱️  Duration: ${result.duration ? Math.round(result.duration) + 's' : 'N/A'}`);
      console.log(`   📦 Format: ${result.format || 'N/A'}`);
    } else {
      console.log(`   ❌ Failed: ${result.error}`);
    }
  });

  // Create a JSON file with URLs for easy reference
  console.log('\n' + '=' .repeat(70));
  console.log('📝 Creating URL reference file...');
  
  const urlMapping = results
    .filter(r => r.url)
    .map(r => ({
      topic: r.topic,
      videoName: r.videoName,
      cloudinaryUrl: r.url,
      publicId: r.publicId,
      duration: r.duration,
      format: r.format
    }));

  const outputPath = path.join(__dirname, 'cloudinary_video_urls.json');
  fs.writeFileSync(outputPath, JSON.stringify(urlMapping, null, 2));
  console.log(`✅ URLs saved to: ${outputPath}`);

  // Display MongoDB update queries
  console.log('\n' + '=' .repeat(70));
  console.log('📋 MONGODB UPDATE QUERIES');
  console.log('=' .repeat(70));
  console.log('\nCopy these commands to update your database:\n');

  urlMapping.forEach((video) => {
    console.log(`// Update ${video.topic} (${video.videoName})`);
    console.log(`db.videoquestions.updateOne(`);
    console.log(`  { topic: "${video.topic}", class: "NMMS" },`);
    console.log(`  { $set: { videoUrl: "${video.cloudinaryUrl}" } }`);
    console.log(`);`);
    console.log('');
  });

  console.log('=' .repeat(70));
  console.log(`\n✅ Upload process completed!`);
  console.log(`📊 Successful: ${urlMapping.length}/${videos.length}`);
  console.log(`❌ Failed: ${videos.length - urlMapping.length}/${videos.length}\n`);
}

// Run the upload
uploadAllVideos().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

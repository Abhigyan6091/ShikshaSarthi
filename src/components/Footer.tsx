
import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-50 border-t">
      <div className="edu-container py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-bold text-lg mb-4">ShikshaSarthi</h3>
            <p className="text-gray-600">
              A comprehensive platform for NMMS exam preparation designed for government school students.
            </p>
          </div>
          
          <div>
            <h3 className="font-bold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-edu-blue hover:underline">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-edu-blue hover:underline">
                  About NMMSE
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold text-lg mb-4">Contact</h3>
            <p className="text-gray-600">
              Email: support@nmmsprep.edu
            </p>
            <p className="text-gray-600 mt-2">
              Phone: +91 1234567890
            </p>
          </div>
        </div>
        
        <div className="border-t border-gray-200 mt-8 pt-6 text-center text-gray-600 text-sm">
          <p>&copy; {new Date().getFullYear()} ShikshaSarthi. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
// this is main heading
export default Footer;

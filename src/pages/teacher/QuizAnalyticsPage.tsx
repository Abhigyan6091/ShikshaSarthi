// import React, { useEffect, useState } from "react";
// import { useParams } from "react-router-dom";
// import axios from "axios";
// import { Card, CardHeader, CardContent } from "@/components/ui/card";
// import { Table, TableHeader, TableBody, TableRow, TableCell } from "@/components/ui/table";
// import { Bar } from "react-chartjs-2";
// import {
//   Chart as ChartJS,
//   BarElement,
//   CategoryScale,
//   LinearScale,
//   Tooltip,
//   Legend
// } from "chart.js";

// ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

// export default function QuizAnalyticsPage() {
//   const { quizId } = useParams();
//   const [studentReports, setStudentReports] = useState([]);
//   const [questionStats, setQuestionStats] = useState([]);

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const [studentRes, quizRes] = await Promise.all([
//           axios.get(`http://localhost:5000/reports/student-quiz/${quizId}`),
//           axios.get(`http://localhost:5000/reports/quiz/${quizId}`)
//         ]);

//         setStudentReports(studentRes.data);
//         setQuestionStats(quizRes.data.questionStats);
//       } catch (error) {
//         console.error("Error fetching analytics:", error);
//       }
//     };

//     fetchData();
//   }, [quizId]);

//   const chartData = {
//     labels: questionStats.map((q, idx) => `Q${idx + 1}`),
//     datasets: [
//       {
//         label: "Correct",
//         data: questionStats.map((q) => q.correctCount),
//         backgroundColor: "#4ade80"
//       },
//       {
//         label: "Incorrect",
//         data: questionStats.map((q) => q.incorrectCount),
//         backgroundColor: "#f87171"
//       },
//       {
//         label: "Unattempted",
//         data: questionStats.map((q) => q.unattemptedCount),
//         backgroundColor: "#facc15"
//       }
//     ]
//   };

//   return (
//     <div className="p-6 space-y-6">
//       <h1 className="text-2xl font-bold">Quiz Analytics</h1>

//       <Card>
//         <CardHeader>Student Performance</CardHeader>
//         <CardContent>
//           <Table>
//             <TableHeader>
//               <TableRow>
//                 <TableCell>Name</TableCell>
//                 <TableCell>Correct</TableCell>
//                 <TableCell>Incorrect</TableCell>
//                 <TableCell>Unattempted</TableCell>
//                 <TableCell>Total</TableCell>
//               </TableRow>
//             </TableHeader>
//             <TableBody>
//               {studentReports.map((report, index) => (
//                 <TableRow key={index}>
//                   <TableCell>{report.studentId}</TableCell> {/* Replace with name if populated */}
//                   <TableCell>{report.correct}</TableCell>
//                   <TableCell>{report.incorrect}</TableCell>
//                   <TableCell>{report.unattempted}</TableCell>
//                   <TableCell>
//                     {report.correct + report.incorrect + report.unattempted}
//                   </TableCell>
//                 </TableRow>
//               ))}
//             </TableBody>
//           </Table>
//         </CardContent>
//       </Card>

//       <Card>
//         <CardHeader>Question-wise Submission Stats</CardHeader>
//         <CardContent>
//           <div className="w-full max-w-4xl">
//             <Bar data={chartData} />
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }


// import React, { useEffect, useState } from "react";
// import { useParams } from "react-router-dom";
// import axios from "axios";
// import { Card, CardHeader, CardContent } from "@/components/ui/card";
// import { 
//   BarChart, 
//   Bar, 
//   XAxis, 
//   YAxis, 
//   CartesianGrid, 
//   Tooltip, 
//   Legend, 
//   ResponsiveContainer,
//   PieChart,
//   Pie,
//   Cell,
//   LineChart,
//   Line,
//   Area,
//   AreaChart
// } from "recharts";
// import { 
//   Trophy, 
//   Users, 
//   Target, 
//   TrendingUp, 
//   CheckCircle, 
//   XCircle, 
//   Clock,
//   BarChart3,
//   PieChart as PieChartIcon
// } from "lucide-react";

// export default function QuizAnalyticsPage() {
//   const { quizId } = useParams();
//   const [studentReports, setStudentReports] = useState([]);
//   const [questionStats, setQuestionStats] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         setLoading(true);
//         const [studentRes, quizRes] = await Promise.all([
//           axios.get(`http://localhost:5000/reports/student-quiz/${quizId}`),
//           axios.get(`http://localhost:5000/reports/quiz/${quizId}`)
//         ]);

//         setStudentReports(studentRes.data);
//         setQuestionStats(quizRes.data.questionStats);
//       } catch (error) {
//         console.error("Error fetching analytics:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, [quizId]);

//   // Calculate overall statistics
//   const totalStudents = studentReports.length;
//   const totalQuestions = questionStats.length;
  
//   const overallStats = studentReports.reduce(
//     (acc, report) => ({
//       correct: acc.correct + report.correct,
//       incorrect: acc.incorrect + report.incorrect,
//       unattempted: acc.unattempted + report.unattempted
//     }),
//     { correct: 0, incorrect: 0, unattempted: 0 }
//   );

//   const totalAttempts = overallStats.correct + overallStats.incorrect + overallStats.unattempted;
//   const averageScore = totalStudents > 0 ? (overallStats.correct / totalAttempts * 100).toFixed(1) : 0;

//   // Prepare data for charts
//   const pieChartData = [
//     { name: 'Correct', value: overallStats.correct, color: '#10b981' },
//     { name: 'Incorrect', value: overallStats.incorrect, color: '#ef4444' },
//     { name: 'Unattempted', value: overallStats.unattempted, color: '#f59e0b' }
//   ];

//   const questionChartData = questionStats.map((q, idx) => ({
//     question: `Q${idx + 1}`,
//     correct: q.correctCount,
//     incorrect: q.incorrectCount,
//     unattempted: q.unattemptedCount,
//     total: q.correctCount + q.incorrectCount + q.unattemptedCount,
//     accuracy: ((q.correctCount / (q.correctCount + q.incorrectCount || 1)) * 100).toFixed(1)
//   }));

//   const studentPerformanceData = studentReports.map((report, idx) => ({
//     student: `Student ${idx + 1}`,
//     score: ((report.correct / (report.correct + report.incorrect + report.unattempted)) * 100).toFixed(1),
//     correct: report.correct,
//     total: report.correct + report.incorrect + report.unattempted
//   })).sort((a, b) => b.score - a.score);

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
//         <div className="text-center space-y-4">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
//           <p className="text-gray-600">Loading analytics...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
//       <div className="container mx-auto p-6 space-y-8">
//         {/* Header */}
//         <div className="text-center space-y-2">
//           <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
//             Quiz Analytics Dashboard
//           </h1>
//           <p className="text-gray-600">Comprehensive performance insights and statistics</p>
//         </div>

//         {/* Key Metrics Cards */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//           <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
//             <CardContent className="p-6">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm font-medium text-gray-600">Total Students</p>
//                   <p className="text-3xl font-bold text-indigo-600">{totalStudents}</p>
//                 </div>
//                 <div className="p-3 bg-indigo-100 rounded-full">
//                   <Users className="h-6 w-6 text-indigo-600" />
//                 </div>
//               </div>
//             </CardContent>
//           </Card>

//           <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
//             <CardContent className="p-6">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm font-medium text-gray-600">Total Questions</p>
//                   <p className="text-3xl font-bold text-purple-600">{totalQuestions}</p>
//                 </div>
//                 <div className="p-3 bg-purple-100 rounded-full">
//                   <Target className="h-6 w-6 text-purple-600" />
//                 </div>
//               </div>
//             </CardContent>
//           </Card>

//           <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
//             <CardContent className="p-6">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm font-medium text-gray-600">Average Score</p>
//                   <p className="text-3xl font-bold text-green-600">{averageScore}%</p>
//                 </div>
//                 <div className="p-3 bg-green-100 rounded-full">
//                   <Trophy className="h-6 w-6 text-green-600" />
//                 </div>
//               </div>
//             </CardContent>
//           </Card>

//           <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
//             <CardContent className="p-6">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm font-medium text-gray-600">Total Attempts</p>
//                   <p className="text-3xl font-bold text-orange-600">{totalAttempts}</p>
//                 </div>
//                 <div className="p-3 bg-orange-100 rounded-full">
//                   <TrendingUp className="h-6 w-6 text-orange-600" />
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//         </div>

//         {/* Charts Section */}
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//           {/* Overall Performance Pie Chart */}
//           <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
//             <CardHeader className="pb-4">
//               <div className="flex items-center gap-2">
//                 <PieChartIcon className="h-5 w-5 text-indigo-600" />
//                 <h3 className="text-xl font-semibold text-gray-800">Overall Performance Distribution</h3>
//               </div>
//             </CardHeader>
//             <CardContent>
//               <ResponsiveContainer width="100%" height={300}>
//                 <PieChart>
//                   <Pie
//                     data={pieChartData}
//                     cx="50%"
//                     cy="50%"
//                     outerRadius={100}
//                     fill="#8884d8"
//                     dataKey="value"
//                     label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
//                   >
//                     {pieChartData.map((entry, index) => (
//                       <Cell key={`cell-${index}`} fill={entry.color} />
//                     ))}
//                   </Pie>
//                   <Tooltip />
//                 </PieChart>
//               </ResponsiveContainer>
//               <div className="flex justify-center space-x-6 mt-4">
//                 <div className="flex items-center gap-2">
//                   <div className="w-4 h-4 bg-green-500 rounded-full"></div>
//                   <span className="text-sm text-gray-600">Correct ({overallStats.correct})</span>
//                 </div>
//                 <div className="flex items-center gap-2">
//                   <div className="w-4 h-4 bg-red-500 rounded-full"></div>
//                   <span className="text-sm text-gray-600">Incorrect ({overallStats.incorrect})</span>
//                 </div>
//                 <div className="flex items-center gap-2">
//                   <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
//                   <span className="text-sm text-gray-600">Unattempted ({overallStats.unattempted})</span>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>

//           {/* Student Performance Area Chart */}
//           <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
//             <CardHeader className="pb-4">
//               <div className="flex items-center gap-2">
//                 <TrendingUp className="h-5 w-5 text-purple-600" />
//                 <h3 className="text-xl font-semibold text-gray-800">Student Performance Trend</h3>
//               </div>
//             </CardHeader>
//             <CardContent>
//               <ResponsiveContainer width="100%" height={300}>
//                 <AreaChart data={studentPerformanceData}>
//                   <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
//                   <XAxis dataKey="student" tick={{ fontSize: 12 }} />
//                   <YAxis tick={{ fontSize: 12 }} />
//                   <Tooltip 
//                     contentStyle={{ 
//                       backgroundColor: 'rgba(255, 255, 255, 0.95)', 
//                       border: 'none', 
//                       borderRadius: '8px',
//                       boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
//                     }}
//                   />
//                   <Area 
//                     type="monotone" 
//                     dataKey="score" 
//                     stroke="#8b5cf6" 
//                     fill="url(#colorGradient)" 
//                     strokeWidth={3}
//                   />
//                   <defs>
//                     <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
//                       <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
//                       <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1}/>
//                     </linearGradient>
//                   </defs>
//                 </AreaChart>
//               </ResponsiveContainer>
//             </CardContent>
//           </Card>
//         </div>

//         {/* Question-wise Analysis */}
//         <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
//           <CardHeader className="pb-4">
//             <div className="flex items-center gap-2">
//               <BarChart3 className="h-5 w-5 text-green-600" />
//               <h3 className="text-xl font-semibold text-gray-800">Question-wise Performance Analysis</h3>
//             </div>
//           </CardHeader>
//           <CardContent>
//             <ResponsiveContainer width="100%" height={400}>
//               <BarChart data={questionChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
//                 <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
//                 <XAxis dataKey="question" tick={{ fontSize: 12 }} />
//                 <YAxis tick={{ fontSize: 12 }} />
//                 <Tooltip 
//                   contentStyle={{ 
//                     backgroundColor: 'rgba(255, 255, 255, 0.95)', 
//                     border: 'none', 
//                     borderRadius: '8px',
//                     boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
//                   }}
//                 />
//                 <Legend />
//                 <Bar dataKey="correct" fill="#10b981" name="Correct" radius={[4, 4, 0, 0]} />
//                 <Bar dataKey="incorrect" fill="#ef4444" name="Incorrect" radius={[4, 4, 0, 0]} />
//                 <Bar dataKey="unattempted" fill="#f59e0b" name="Unattempted" radius={[4, 4, 0, 0]} />
//               </BarChart>
//             </ResponsiveContainer>
//           </CardContent>
//         </Card>

//         {/* Student Performance Table */}
//         <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
//           <CardHeader className="pb-4">
//             <div className="flex items-center gap-2">
//               <Users className="h-5 w-5 text-blue-600" />
//               <h3 className="text-xl font-semibold text-gray-800">Detailed Student Performance</h3>
//             </div>
//           </CardHeader>
//           <CardContent>
//             <div className="overflow-x-auto">
//               <table className="w-full">
//                 <thead>
//                   <tr className="border-b border-gray-200">
//                     <th className="text-left py-3 px-4 font-semibold text-gray-700">Rank</th>
//                     <th className="text-left py-3 px-4 font-semibold text-gray-700">Student ID</th>
//                     <th className="text-center py-3 px-4 font-semibold text-gray-700">Score</th>
//                     <th className="text-center py-3 px-4 font-semibold text-gray-700">Correct</th>
//                     <th className="text-center py-3 px-4 font-semibold text-gray-700">Incorrect</th>
//                     <th className="text-center py-3 px-4 font-semibold text-gray-700">Unattempted</th>
//                     <th className="text-center py-3 px-4 font-semibold text-gray-700">Total</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {studentReports
//                     .map((report, index) => ({
//                       ...report,
//                       score: ((report.correct / (report.correct + report.incorrect + report.unattempted)) * 100).toFixed(1),
//                       total: report.correct + report.incorrect + report.unattempted
//                     }))
//                     .sort((a, b) => b.score - a.score)
//                     .map((report, index) => (
//                     <tr key={index} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
//                       <td className="py-3 px-4">
//                         <div className="flex items-center gap-2">
//                           {index < 3 && <Trophy className={`h-4 w-4 ${index === 0 ? 'text-yellow-500' : index === 1 ? 'text-gray-400' : 'text-orange-600'}`} />}
//                           <span className="font-medium">#{index + 1}</span>
//                         </div>
//                       </td>
//                       <td className="py-3 px-4 font-medium text-gray-800">{report.studentId}</td>
//                       <td className="py-3 px-4 text-center">
//                         <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
//                           report.score >= 80 ? 'bg-green-100 text-green-800' :
//                           report.score >= 60 ? 'bg-yellow-100 text-yellow-800' :
//                           'bg-red-100 text-red-800'
//                         }`}>
//                           {report.score}%
//                         </span>
//                       </td>
//                       <td className="py-3 px-4 text-center">
//                         <div className="flex items-center justify-center gap-1">
//                           <CheckCircle className="h-4 w-4 text-green-500" />
//                           <span className="font-medium text-green-700">{report.correct}</span>
//                         </div>
//                       </td>
//                       <td className="py-3 px-4 text-center">
//                         <div className="flex items-center justify-center gap-1">
//                           <XCircle className="h-4 w-4 text-red-500" />
//                           <span className="font-medium text-red-700">{report.incorrect}</span>
//                         </div>
//                       </td>
//                       <td className="py-3 px-4 text-center">
//                         <div className="flex items-center justify-center gap-1">
//                           <Clock className="h-4 w-4 text-yellow-500" />
//                           <span className="font-medium text-yellow-700">{report.unattempted}</span>
//                         </div>
//                       </td>
//                       <td className="py-3 px-4 text-center font-medium text-gray-800">{report.total}</td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// }


// import React, { useEffect, useState } from "react";
// import { useParams } from "react-router-dom";
// import axios from "axios";
// import { Card, CardHeader, CardContent } from "@/components/ui/card";
// import { 
//   BarChart, 
//   Bar, 
//   XAxis, 
//   YAxis, 
//   CartesianGrid, 
//   Tooltip, 
//   Legend, 
//   ResponsiveContainer,
//   PieChart,
//   Pie,
//   Cell,
//   LineChart,
//   Line,
//   Area,
//   AreaChart
// } from "recharts";
// import { 
//   Trophy, 
//   Users, 
//   Target, 
//   TrendingUp, 
//   CheckCircle, 
//   XCircle, 
//   Clock,
//   BarChart3,
//   PieChart as PieChartIcon
// } from "lucide-react";

// export default function QuizAnalyticsPage() {
//   const { quizId } = useParams();
//   const [studentReports, setStudentReports] = useState([]);
//   const [questionStats, setQuestionStats] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         setLoading(true);
//         const [studentRes, quizRes] = await Promise.all([
//           axios.get(`http://localhost:5000/reports/student-quiz/${quizId}`),
//           axios.get(`http://localhost:5000/reports/quiz/${quizId}`)
//         ]);

//         setStudentReports(studentRes.data);
//         setQuestionStats(quizRes.data.questionStats);
//       } catch (error) {
//         console.error("Error fetching analytics:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, [quizId]);

//   // Calculate overall statistics
//   const totalStudents = studentReports.length;
//   const totalQuestions = questionStats.length;
  
//   const overallStats = studentReports.reduce(
//     (acc, report) => ({
//       correct: acc.correct + report.correct,
//       incorrect: acc.incorrect + report.incorrect,
//       unattempted: acc.unattempted + report.unattempted
//     }),
//     { correct: 0, incorrect: 0, unattempted: 0 }
//   );

//   const totalAttempts = overallStats.correct + overallStats.incorrect + overallStats.unattempted;
//   const averageScore = totalAttempts > 0 ? (overallStats.correct / totalAttempts * 100).toFixed(1) : 0;

//   // Prepare data for charts
//   const pieChartData = [
//     { name: 'Correct', value: overallStats.correct, color: '#10b981' },
//     { name: 'Incorrect', value: overallStats.incorrect, color: '#ef4444' },
//     { name: 'Unattempted', value: overallStats.unattempted, color: '#f59e0b' }
//   ];

//   const questionChartData = questionStats.map((q, idx) => ({
//     question: `Q${idx + 1}`,
//     correct: q.correctCount,
//     incorrect: q.incorrectCount,
//     unattempted: q.unattemptedCount,
//     total: q.correctCount + q.incorrectCount + q.unattemptedCount,
//     accuracy: ((q.correctCount / (q.correctCount + q.incorrectCount || 1)) * 100).toFixed(1)
//   }));

//   const studentPerformanceData = studentReports.map((report, idx) => ({
//     student: report.name || report.studentId,
//     score: report.correct + report.incorrect + report.unattempted > 0 
//       ? ((report.correct / (report.correct + report.incorrect + report.unattempted)) * 100).toFixed(1)
//       : 0,
//     correct: report.correct,
//     total: report.correct + report.incorrect + report.unattempted
//   })).sort((a, b) => b.score - a.score);

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
//         <div className="text-center space-y-4">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
//           <p className="text-gray-600">Loading analytics...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
//       <div className="container mx-auto p-6 space-y-8">
//         {/* Header */}
//         <div className="text-center space-y-2">
//           <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
//             Quiz Analytics Dashboard
//           </h1>
//           <p className="text-gray-600">Comprehensive performance insights and statistics</p>
//         </div>

//         {/* Key Metrics Cards */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//           <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
//             <CardContent className="p-6">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm font-medium text-gray-600">Total Students</p>
//                   <p className="text-3xl font-bold text-indigo-600">{totalStudents}</p>
//                 </div>
//                 <div className="p-3 bg-indigo-100 rounded-full">
//                   <Users className="h-6 w-6 text-indigo-600" />
//                 </div>
//               </div>
//             </CardContent>
//           </Card>

//           <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
//             <CardContent className="p-6">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm font-medium text-gray-600">Total Questions</p>
//                   <p className="text-3xl font-bold text-purple-600">{totalQuestions}</p>
//                 </div>
//                 <div className="p-3 bg-purple-100 rounded-full">
//                   <Target className="h-6 w-6 text-purple-600" />
//                 </div>
//               </div>
//             </CardContent>
//           </Card>

//           <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
//             <CardContent className="p-6">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm font-medium text-gray-600">Average Score</p>
//                   <p className="text-3xl font-bold text-green-600">{averageScore}%</p>
//                 </div>
//                 <div className="p-3 bg-green-100 rounded-full">
//                   <Trophy className="h-6 w-6 text-green-600" />
//                 </div>
//               </div>
//             </CardContent>
//           </Card>

//           <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
//             <CardContent className="p-6">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm font-medium text-gray-600">Total Attempts</p>
//                   <p className="text-3xl font-bold text-orange-600">{totalAttempts}</p>
//                 </div>
//                 <div className="p-3 bg-orange-100 rounded-full">
//                   <TrendingUp className="h-6 w-6 text-orange-600" />
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//         </div>

//         {/* Charts Section */}
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//           {/* Overall Performance Pie Chart */}
//           <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
//             <CardHeader className="pb-4">
//               <div className="flex items-center gap-2">
//                 <PieChartIcon className="h-5 w-5 text-indigo-600" />
//                 <h3 className="text-xl font-semibold text-gray-800">Overall Performance Distribution</h3>
//               </div>
//             </CardHeader>
//             <CardContent>
//               <ResponsiveContainer width="100%" height={300}>
//                 <PieChart>
//                   <Pie
//                     data={pieChartData}
//                     cx="50%"
//                     cy="50%"
//                     outerRadius={100}
//                     fill="#8884d8"
//                     dataKey="value"
//                     label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
//                   >
//                     {pieChartData.map((entry, index) => (
//                       <Cell key={`cell-${index}`} fill={entry.color} />
//                     ))}
//                   </Pie>
//                   <Tooltip />
//                 </PieChart>
//               </ResponsiveContainer>
//               <div className="flex justify-center space-x-6 mt-4">
//                 <div className="flex items-center gap-2">
//                   <div className="w-4 h-4 bg-green-500 rounded-full"></div>
//                   <span className="text-sm text-gray-600">Correct ({overallStats.correct})</span>
//                 </div>
//                 <div className="flex items-center gap-2">
//                   <div className="w-4 h-4 bg-red-500 rounded-full"></div>
//                   <span className="text-sm text-gray-600">Incorrect ({overallStats.incorrect})</span>
//                 </div>
//                 <div className="flex items-center gap-2">
//                   <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
//                   <span className="text-sm text-gray-600">Unattempted ({overallStats.unattempted})</span>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>

//           {/* Student Performance Area Chart */}
//           <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
//             <CardHeader className="pb-4">
//               <div className="flex items-center gap-2">
//                 <TrendingUp className="h-5 w-5 text-purple-600" />
//                 <h3 className="text-xl font-semibold text-gray-800">Student Performance Trend</h3>
//               </div>
//             </CardHeader>
//             <CardContent>
//               <ResponsiveContainer width="100%" height={300}>
//                 <AreaChart data={studentPerformanceData}>
//                   <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
//                   <XAxis dataKey="student" tick={{ fontSize: 12 }} />
//                   <YAxis tick={{ fontSize: 12 }} />
//                   <Tooltip 
//                     contentStyle={{ 
//                       backgroundColor: 'rgba(255, 255, 255, 0.95)', 
//                       border: 'none', 
//                       borderRadius: '8px',
//                       boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
//                     }}
//                   />
//                   <Area 
//                     type="monotone" 
//                     dataKey="score" 
//                     stroke="#8b5cf6" 
//                     fill="url(#colorGradient)" 
//                     strokeWidth={3}
//                   />
//                   <defs>
//                     <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
//                       <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
//                       <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1}/>
//                     </linearGradient>
//                   </defs>
//                 </AreaChart>
//               </ResponsiveContainer>
//             </CardContent>
//           </Card>
//         </div>

//         {/* Question-wise Analysis */}
//         <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
//           <CardHeader className="pb-4">
//             <div className="flex items-center gap-2">
//               <BarChart3 className="h-5 w-5 text-green-600" />
//               <h3 className="text-xl font-semibold text-gray-800">Question-wise Performance Analysis</h3>
//             </div>
//           </CardHeader>
//           <CardContent>
//             <ResponsiveContainer width="100%" height={400}>
//               <BarChart data={questionChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
//                 <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
//                 <XAxis dataKey="question" tick={{ fontSize: 12 }} />
//                 <YAxis tick={{ fontSize: 12 }} />
//                 <Tooltip 
//                   contentStyle={{ 
//                     backgroundColor: 'rgba(255, 255, 255, 0.95)', 
//                     border: 'none', 
//                     borderRadius: '8px',
//                     boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
//                   }}
//                 />
//                 <Legend />
//                 <Bar dataKey="correct" fill="#10b981" name="Correct" radius={[4, 4, 0, 0]} />
//                 <Bar dataKey="incorrect" fill="#ef4444" name="Incorrect" radius={[4, 4, 0, 0]} />
//                 <Bar dataKey="unattempted" fill="#f59e0b" name="Unattempted" radius={[4, 4, 0, 0]} />
//               </BarChart>
//             </ResponsiveContainer>
//           </CardContent>
//         </Card>

//         {/* Student Performance Table */}
//         <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
//           <CardHeader className="pb-4">
//             <div className="flex items-center gap-2">
//               <Users className="h-5 w-5 text-blue-600" />
//               <h3 className="text-xl font-semibold text-gray-800">Detailed Student Performance</h3>
//             </div>
//           </CardHeader>
//           <CardContent>
//             <div className="overflow-x-auto">
//               <table className="w-full">
//                 <thead>
//                   <tr className="border-b border-gray-200">
//                     <th className="text-left py-3 px-4 font-semibold text-gray-700">Rank</th>
//                     <th className="text-left py-3 px-4 font-semibold text-gray-700">Student Name</th>
//                     <th className="text-left py-3 px-4 font-semibold text-gray-700">Student ID</th>
//                     <th className="text-center py-3 px-4 font-semibold text-gray-700">Score</th>
//                     <th className="text-center py-3 px-4 font-semibold text-gray-700">Correct</th>
//                     <th className="text-center py-3 px-4 font-semibold text-gray-700">Incorrect</th>
//                     <th className="text-center py-3 px-4 font-semibold text-gray-700">Unattempted</th>
//                     <th className="text-center py-3 px-4 font-semibold text-gray-700">Total</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {studentReports
//                     .map((report, index) => ({
//                       ...report,
//                       score: report.correct + report.incorrect + report.unattempted > 0
//                         ? ((report.correct / (report.correct + report.incorrect + report.unattempted)) * 100).toFixed(1)
//                         : 0,
//                       total: report.correct + report.incorrect + report.unattempted
//                     }))
//                     .sort((a, b) => b.score - a.score)
//                     .map((report, index) => (
//                     <tr key={index} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
//                       <td className="py-3 px-4">
//                         <div className="flex items-center gap-2">
//                           {index < 3 && <Trophy className={`h-4 w-4 ${index === 0 ? 'text-yellow-500' : index === 1 ? 'text-gray-400' : 'text-orange-600'}`} />}
//                           <span className="font-medium">#{index + 1}</span>
//                         </div>
//                       </td>
//                       <td className="py-3 px-4 font-medium text-gray-800">
//                         {report.name || 'N/A'}
//                       </td>
//                       <td className="py-3 px-4 text-gray-600">{report.studentId}</td>
//                       <td className="py-3 px-4 text-center">
//                         <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
//                           report.score >= 80 ? 'bg-green-100 text-green-800' :
//                           report.score >= 60 ? 'bg-yellow-100 text-yellow-800' :
//                           'bg-red-100 text-red-800'
//                         }`}>
//                           {report.score}%
//                         </span>
//                       </td>
//                       <td className="py-3 px-4 text-center">
//                         <div className="flex items-center justify-center gap-1">
//                           <CheckCircle className="h-4 w-4 text-green-500" />
//                           <span className="font-medium text-green-700">{report.correct}</span>
//                         </div>
//                       </td>
//                       <td className="py-3 px-4 text-center">
//                         <div className="flex items-center justify-center gap-1">
//                           <XCircle className="h-4 w-4 text-red-500" />
//                           <span className="font-medium text-red-700">{report.incorrect}</span>
//                         </div>
//                       </td>
//                       <td className="py-3 px-4 text-center">
//                         <div className="flex items-center justify-center gap-1">
//                           <Clock className="h-4 w-4 text-yellow-500" />
//                           <span className="font-medium text-yellow-700">{report.unattempted}</span>
//                         </div>
//                       </td>
//                       <td className="py-3 px-4 text-center font-medium text-gray-800">{report.total}</td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// }
const API_URL = import.meta.env.VITE_API_URL;
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import Header from "@/components/Header";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from "recharts";
import { 
  Trophy, 
  Users, 
  Target, 
  TrendingUp, 
  CheckCircle, 
  XCircle, 
  Clock,
  BarChart3,
  PieChart as PieChartIcon
} from "lucide-react";

export default function QuizAnalyticsPage() {
  const { quizId } = useParams();
  const [studentReports, setStudentReports] = useState([]);
  const [questionStats, setQuestionStats] = useState([]);
  const [studentNames, setStudentNames] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch student reports and quiz reports independently
        // QuizReport may not exist if quiz was submitted via advanced player
        let studentReportsData = [];
        let questionStatsData = [];

        try {
          const studentRes = await axios.get(`${API_URL}/reports/student-quiz/${quizId}`);
          studentReportsData = studentRes.data || [];
        } catch (err) {
          console.warn("Could not fetch student reports:", err.message);
        }

        try {
          const quizRes = await axios.get(`${API_URL}/reports/quiz/${quizId}`);
          questionStatsData = quizRes.data?.questionStats || [];
        } catch (err) {
          console.warn("QuizReport not found (may not exist for advanced quizzes):", err.message);
        }

        setStudentReports(studentReportsData);
        setQuestionStats(questionStatsData);

        // Fetch student names for all unique student IDs
        const uniqueStudentIds = [...new Set(studentReportsData.map(report => report.studentId))];
        const namePromises = uniqueStudentIds.map(async (studentId) => {
          try {
            const response = await axios.get(`${API_URL}/students/${studentId}`);
            return { studentId, name: response.data.name || response.data.fullName || 'Unknown' };
          } catch (error) {
            console.error(`Error fetching student ${studentId}:`, error);
            return { studentId, name: 'Unknown' };
          }
        });

        const studentNamesArray = await Promise.all(namePromises);
        const studentNamesMap = studentNamesArray.reduce((acc, { studentId, name }) => {
          acc[studentId] = name;
          return acc;
        }, {});

        setStudentNames(studentNamesMap);
      } catch (error) {
        console.error("Error fetching analytics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [quizId]);

  // Calculate overall statistics
  const totalStudents = studentReports.length;
  const totalQuestions = questionStats.length;
  
  const overallStats = studentReports.reduce(
    (acc, report) => ({
      correct: acc.correct + report.correct,
      incorrect: acc.incorrect + report.incorrect,
      unattempted: acc.unattempted + report.unattempted
    }),
    { correct: 0, incorrect: 0, unattempted: 0 }
  );

  const totalAttempts = overallStats.correct + overallStats.incorrect + overallStats.unattempted;
  const averageScore = totalAttempts > 0 ? (overallStats.correct / totalAttempts * 100).toFixed(1) : 0;

  // Prepare data for charts
  const pieChartData = [
    { name: 'Correct', value: overallStats.correct, color: '#10b981' },
    { name: 'Incorrect', value: overallStats.incorrect, color: '#ef4444' },
    { name: 'Unattempted', value: overallStats.unattempted, color: '#f59e0b' }
  ];

  const questionChartData = questionStats.map((q, idx) => ({
    question: `Q${idx + 1}`,
    correct: q.correctCount,
    incorrect: q.incorrectCount,
    unattempted: q.unattemptedCount,
    total: q.correctCount + q.incorrectCount + q.unattemptedCount,
    accuracy: ((q.correctCount / (q.correctCount + q.incorrectCount || 1)) * 100).toFixed(1)
  }));

  const studentPerformanceData = studentReports.map((report, idx) => ({
    student: studentNames[report.studentId] || report.studentId,
    score: report.correct + report.incorrect + report.unattempted > 0 
      ? ((report.correct / (report.correct + report.incorrect + report.unattempted)) * 100).toFixed(1)
      : 0,
    correct: report.correct,
    total: report.correct + report.incorrect + report.unattempted
  })).sort((a, b) => b.score - a.score);

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <Header />
        <div className="flex flex-1 items-center justify-center">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="text-gray-600">Loading analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Header />
      <div className="container mx-auto p-3 sm:p-6 space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Quiz Analytics Dashboard
          </h1>
          <p className="text-gray-600">Comprehensive performance insights and statistics</p>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Students</p>
                  <p className="text-3xl font-bold text-indigo-600">{totalStudents}</p>
                </div>
                <div className="p-3 bg-indigo-100 rounded-full">
                  <Users className="h-6 w-6 text-indigo-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Questions</p>
                  <p className="text-3xl font-bold text-purple-600">{totalQuestions}</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <Target className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Average Score</p>
                  <p className="text-3xl font-bold text-green-600">{averageScore}%</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <Trophy className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Attempts</p>
                  <p className="text-3xl font-bold text-orange-600">{totalAttempts}</p>
                </div>
                <div className="p-3 bg-orange-100 rounded-full">
                  <TrendingUp className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Overall Performance Pie Chart */}
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <PieChartIcon className="h-5 w-5 text-indigo-600" />
                <h3 className="text-xl font-semibold text-gray-800">Overall Performance Distribution</h3>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Correct ({overallStats.correct})</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Incorrect ({overallStats.incorrect})</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Unattempted ({overallStats.unattempted})</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Student Performance Area Chart */}
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-purple-600" />
                <h3 className="text-xl font-semibold text-gray-800">Student Performance Trend</h3>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={studentPerformanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                  <XAxis dataKey="student" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                      border: 'none', 
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="score" 
                    stroke="#8b5cf6" 
                    fill="url(#colorGradient)" 
                    strokeWidth={3}
                  />
                  <defs>
                    <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Question-wise Analysis */}
        <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-green-600" />
              <h3 className="text-xl font-semibold text-gray-800">Question-wise Performance Analysis</h3>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={questionChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                <XAxis dataKey="question" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                    border: 'none', 
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Legend />
                <Bar dataKey="correct" fill="#10b981" name="Correct" radius={[4, 4, 0, 0]} />
                <Bar dataKey="incorrect" fill="#ef4444" name="Incorrect" radius={[4, 4, 0, 0]} />
                <Bar dataKey="unattempted" fill="#f59e0b" name="Unattempted" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Student Performance Table */}
        <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              <h3 className="text-xl font-semibold text-gray-800">Detailed Student Performance</h3>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Rank</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Student Name</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Student ID</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Score</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Correct</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Incorrect</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Unattempted</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {studentReports
                    .map((report, index) => ({
                      ...report,
                      score: report.correct + report.incorrect + report.unattempted > 0
                        ? ((report.correct / (report.correct + report.incorrect + report.unattempted)) * 100).toFixed(1)
                        : 0,
                      total: report.correct + report.incorrect + report.unattempted
                    }))
                    .sort((a, b) => b.score - a.score)
                    .map((report, index) => (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {index < 3 && <Trophy className={`h-4 w-4 ${index === 0 ? 'text-yellow-500' : index === 1 ? 'text-gray-400' : 'text-orange-600'}`} />}
                          <span className="font-medium">#{index + 1}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-medium text-gray-800">
                        {studentNames[report.studentId] || 'Loading...'}
                      </td>
                      <td className="py-3 px-4 text-gray-600">{report.studentId}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          report.score >= 80 ? 'bg-green-100 text-green-800' :
                          report.score >= 60 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {report.score}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="font-medium text-green-700">{report.correct}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <XCircle className="h-4 w-4 text-red-500" />
                          <span className="font-medium text-red-700">{report.incorrect}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Clock className="h-4 w-4 text-yellow-500" />
                          <span className="font-medium text-yellow-700">{report.unattempted}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center font-medium text-gray-800">{report.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

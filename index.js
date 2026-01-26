const { useState, useEffect } = React;
const { createRoot } = ReactDOM;

// --- LOCALHOST SETTING ---
// Keep this as '/quickkita' for your local computer (XAMPP/AMPPS).
const API_BASE_PATH = '/quickkita'; 

/* --- CONSTANTS --- */
const CDO_BARANGAYS = [
    "Agusan", "Baikingon", "Balubal", "Balulang", "Barangay 1-40 (Poblacion)", "Bayabas", "Bayanga", "Besigan", 
    "Bonbon", "Bugo", "Bulua", "Camaman-an", "Canitoan", "Carmen", "Consolacion", "Cugman", "Dansolihon", 
    "F.S. Catanico", "Gusa", "Indahag", "Iponan", "Kauswagan", "Lapasan", "Lumbia", "Macabalan", "Macasandig", 
    "Mambuaya", "Nazareth", "Pagatpat", "Pagawan", "Patag", "Pigua", "Puerto", "Puntod", "San Simon", "Tablon", 
    "Taglimao", "Tagpangi", "Tignapoloan", "Tuburan", "Tumpagon"
];

/* --- ICONS --- */
const Icon = ({ path, className = "w-6 h-6" }) => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d={path} /></svg> );
const ICONS = { 
    Clock: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z M12 7v5l3 3", 
    Search: "M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16z M21 21l-4.35-4.35", 
    LogOut: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4 M16 17l5-5-5-5 M21 12H9", 
    User: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 11A4 4 0 1 0 12 3a4 4 0 0 0 0 8z", 
    PlusCircle: "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z M12 8v8 M8 12h8", 
    Users: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75",
    Star: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
    Alert: "M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01",
    Check: "M22 11.08V12a10 10 0 1 1-5.93-9.14 M22 4L12 14.01l-3-3",
    Briefcase: "M20 7h-3a2 2 0 0 0-2-2h-6a2 2 0 0 0-2 2H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z M9 7h6v2H9V7z",
    Shield: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
    Camera: "M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z M12 13a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"
};

const api = { get: async (url) => { const res = await fetch(API_BASE_PATH + url); return res.json(); }, post: async (url, data) => { const res = await fetch(API_BASE_PATH + url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }); return res.json(); } };
const Categories = ["Household Chores", "Tutoring", "Errands", "Carpentry", "Plumbing", "Electrical", "Gardening", "Event Staff"];

/* --- SUB-COMPONENTS --- */

const StarRating = ({ rating, setRating, interactive = false }) => (
    <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
            <svg key={star} onClick={() => interactive && setRating(star)} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={star <= rating ? "#F59E0B" : "none"} stroke={star <= rating ? "#F59E0B" : "#D1D5DB"} strokeWidth="2" className={`w-6 h-6 ${interactive ? 'cursor-pointer transform hover:scale-110 transition' : ''}`}><path d={ICONS.Star} /></svg>
        ))}
    </div>
);

const PaymentModal = ({ isOpen, onClose, onSubmit }) => {
    const [file, setFile] = useState(null);
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-50 px-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-fade-in-up">
                <div className="text-center mb-6"><h3 className="text-xl font-bold text-gray-900">Upload Payment Proof</h3><p className="text-gray-500 text-sm">Please upload a screenshot of your GCash/Bank transfer receipt.</p></div>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 mb-4 hover:bg-gray-50 transition text-center cursor-pointer relative">
                    <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                    <Icon path={ICONS.Camera} className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                    <span className="text-sm text-gray-500 font-medium">{file ? file.name : "Tap to select image"}</span>
                </div>
                <div className="flex space-x-3"><button onClick={onClose} className="flex-1 py-3 text-gray-500 font-bold hover:bg-gray-50 rounded-lg transition">Cancel</button><button onClick={() => onSubmit(file)} disabled={!file} className="flex-1 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 shadow-lg shadow-green-200 transition disabled:opacity-50">Submit Proof</button></div>
            </div>
        </div>
    );
};

const ReviewModal = ({ isOpen, onClose, onSubmit, isWorkerRatingEmployer }) => {
    const [stars, setStars] = useState(5);
    const [comment, setComment] = useState('');
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-50 px-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-fade-in-up">
                <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4"><Icon path={ICONS.Check} className="w-8 h-8" /></div>
                    <h3 className="text-2xl font-bold text-gray-900">{isWorkerRatingEmployer ? "Rate Employer" : "Rate Worker"}</h3>
                    <p className="text-gray-500 text-sm">{isWorkerRatingEmployer ? "Payment confirmed! How was the employer?" : "Gig done! How was the worker?"}</p>
                </div>
                <div className="flex justify-center mb-6"><StarRating rating={stars} setRating={setStars} interactive={true} /></div>
                <textarea className="w-full border border-gray-200 rounded-lg p-3 mb-4 focus:ring-2 focus:ring-indigo-600 outline-none resize-none text-sm" rows="3" placeholder="Write a short review..." value={comment} onChange={(e) => setComment(e.target.value)} />
                <div className="flex space-x-3"><button onClick={onClose} className="flex-1 py-3 text-gray-500 font-bold hover:bg-gray-50 rounded-lg transition">Cancel</button><button onClick={() => onSubmit({ stars, comment })} className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition">Submit</button></div>
            </div>
        </div>
    );
};

const ReportModal = ({ isOpen, onClose, onSubmit }) => {
    const [reason, setReason] = useState('');
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-50 px-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6">
                <div className="flex items-center text-red-600 mb-4"><Icon path={ICONS.Alert} className="w-6 h-6 mr-2" /><h3 className="text-xl font-bold">Report Issue</h3></div>
                <p className="text-gray-600 text-sm mb-4">Please describe the issue with this gig or user.</p>
                <textarea className="w-full border border-gray-200 rounded-lg p-3 mb-6 focus:ring-2 focus:ring-red-500 outline-none text-sm" rows="4" placeholder="e.g., Non-payment, harassment, no-show..." value={reason} onChange={(e) => setReason(e.target.value)} />
                <div className="flex space-x-3"><button onClick={onClose} className="flex-1 py-2 text-gray-500 font-bold hover:bg-gray-50 rounded-lg">Cancel</button><button onClick={() => onSubmit(reason)} className="flex-1 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700">Report</button></div>
            </div>
        </div>
    );
};

const AdminDashboard = ({ onResolve }) => {
    const [disputes, setDisputes] = useState([]);
    useEffect(() => { const fetchDisputes = async () => { try { const data = await api.get('/api/admin/disputes'); if(Array.isArray(data)) setDisputes(data); } catch(e){} }; fetchDisputes(); }, []);
    return (
        <div className="max-w-6xl mx-auto px-4 py-12">
            <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center"><Icon path={ICONS.Shield} className="w-8 h-8 mr-2 text-red-600" /> Admin Console</h1>
            <p className="text-gray-500 mb-8">Manage reported gigs and disputes.</p>
            {disputes.length === 0 ? (<div className="p-12 text-center bg-white rounded-xl border border-gray-200 text-gray-500">No active disputes. Good job!</div>) : (<div className="space-y-4">{disputes.map(job => (<div key={job.id} className="bg-white p-6 rounded-xl border-l-4 border-red-500 shadow-sm"><div className="flex justify-between items-start"><div><h3 className="font-bold text-lg text-red-700">DISPUTE: {job.title}</h3><p className="text-gray-600 text-sm mt-1"><strong>Employer:</strong> {job.employer_name} | <strong>Worker:</strong> {job.worker_name || 'N/A'}</p><p className="mt-4 bg-red-50 p-3 rounded text-red-800 text-sm"><strong>Report Reason:</strong> {job.report_reason}</p></div><button onClick={() => onResolve(job.id)} className="bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-900">Mark Resolved (Close)</button></div></div>))}</div>)}
        </div>
    );
};

const Navbar = ({ user, onLogout, setPage }) => (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4">
            <div className="flex justify-between h-16">
                <div className="flex items-center cursor-pointer" onClick={() => setPage('home')}><span className="text-2xl font-bold"><span className="text-indigo-600">Quic</span><span className="text-amber-500">Kita</span></span></div>
                <div className="flex items-center space-x-2 md:space-x-4">
                    {user ? (
                        <>
                            <button onClick={() => setPage('profile')} className="hidden md:flex items-center text-gray-700 mr-2 hover:bg-gray-100 px-2 py-1 rounded-lg transition">
                                <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold mr-2">{user.name.charAt(0)}</div>
                                <div className="text-left"><span className="block font-medium text-sm leading-none">{user.name}</span><span className="text-xs text-indigo-600 font-bold uppercase">{user.role == 1 ? 'Employer' : (user.role == 3 ? 'Admin' : 'Worker')}</span></div>
                            </button>
                            {user.role == 3 && <button onClick={() => setPage('admin')} className="text-red-600 font-bold text-sm px-3">ADMIN</button>}
                            {user.role == 1 && (<><button onClick={() => setPage('my-jobs')} className="hidden md:inline px-3 text-sm font-medium text-gray-600">My Gigs</button><button onClick={() => setPage('post-job')} className="bg-indigo-600 text-white p-2 md:px-4 md:py-2 rounded-lg font-medium hover:bg-indigo-700 flex items-center transition"><Icon path={ICONS.PlusCircle} className="w-4 h-4 md:mr-2" /><span className="hidden md:inline">Post Gig</span></button></>)}
                            {user.role == 2 && (<button onClick={() => setPage('my-apps')} className="hidden md:inline px-3 text-sm font-medium text-gray-600">My Apps</button>)}
                            <button onClick={onLogout} className="text-gray-500 hover:text-red-500 p-2 ml-1"><Icon path={ICONS.LogOut} className="w-6 h-6" /></button>
                        </>
                    ) : (
                        <><button onClick={() => setPage('login')} className="text-gray-600 hover:text-indigo-600 font-medium px-3 py-2 text-sm md:text-base">Log In</button><button onClick={() => setPage('signup')} className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition text-sm md:text-base">Sign Up</button></>
                    )}
                </div>
            </div>
        </div>
    </nav>
);

const Hero = ({ onFindJobsClick, setPage }) => (
    <div className="bg-white text-center pt-16 pb-12 px-4">
        <h1 className="text-4xl md:text-6xl font-extrabold mb-6 text-gray-900 tracking-tight">"Hanap, kita, <span className="text-indigo-600">Quic</span><span className="text-amber-500">Kita!</span>"</h1>
        <p className="mb-8 text-gray-600 text-lg md:text-xl max-w-2xl mx-auto">Your trusted platform for connecting with neighbors for quick gigs and earnings.</p>
        <div className="flex flex-row justify-center space-x-4">
            <button onClick={onFindJobsClick} className="w-1/2 md:w-auto bg-indigo-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-200">Find a Gig</button>
            <button onClick={() => setPage('post-job')} className="w-1/2 md:w-auto bg-gray-100 text-gray-800 px-6 py-3 rounded-lg font-bold hover:bg-gray-200 transition">Post a Gig</button>
        </div>
    </div>
);

const HowItWorks = () => (
    <div className="max-w-6xl mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center flex flex-col items-center"><div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold text-xl mb-4">1</div><h3 className="text-lg font-bold text-gray-900 mb-2">Sign Up & Verify</h3><p className="text-gray-500 text-sm">Create your profile as a Worker or Employer.</p></div>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center flex flex-col items-center"><div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold text-xl mb-4">2</div><h3 className="text-lg font-bold text-gray-900 mb-2">Post or Find Gigs</h3><p className="text-gray-500 text-sm">Employers post tasks, Workers browse opportunities.</p></div>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center flex flex-col items-center"><div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold text-xl mb-4">3</div><h3 className="text-lg font-bold text-gray-900 mb-2">Connect & Complete</h3><p className="text-gray-500 text-sm">Apply, get hired, complete the task, and get paid.</p></div>
        </div>
    </div>
);

const JobCard = ({ job, onClick, applicationStatus }) => {
    let statusBadge = null;
    let applicantBadge = null;
    let cardBorderClass = "border-gray-100";
    
    if (job.status === 'in_progress') { statusBadge = <span className="text-xs font-bold bg-blue-100 text-blue-700 px-2 py-1 rounded flex items-center animate-pulse"><span className="w-2 h-2 bg-blue-600 rounded-full mr-1"></span> In Progress</span>; cardBorderClass = "border-blue-200 bg-blue-50/30"; }
    if (job.status === 'done_pending') { statusBadge = <span className="text-xs font-bold bg-yellow-100 text-yellow-700 px-2 py-1 rounded flex items-center"><span className="w-2 h-2 bg-yellow-600 rounded-full mr-1"></span> Review Needed</span>; cardBorderClass = "border-yellow-200 bg-yellow-50/30"; }
    if (job.status === 'payment_verification') { statusBadge = <span className="text-xs font-bold bg-purple-100 text-purple-700 px-2 py-1 rounded flex items-center"><span className="w-2 h-2 bg-purple-600 rounded-full mr-1"></span> Payment Sent</span>; cardBorderClass = "border-purple-200 bg-purple-50/30"; }
    if (job.status === 'completed') statusBadge = <span className="text-xs font-bold bg-green-100 text-green-700 px-2 py-1 rounded">Completed</span>;
    if (job.status === 'disputed') statusBadge = <span className="text-xs font-bold bg-red-100 text-red-700 px-2 py-1 rounded">Disputed</span>;

    if (job.applicant_count > 0 && job.status === 'open') {
        applicantBadge = <span className="text-xs font-bold bg-red-100 text-red-700 px-2 py-1 rounded flex items-center"><span className="w-2 h-2 bg-red-600 rounded-full mr-1"></span> {job.applicant_count} Applicant{job.applicant_count > 1 ? 's' : ''}</span>;
    }

    return (
        <div onClick={onClick} className={`p-6 rounded-xl shadow-sm border cursor-pointer hover:shadow-md transition bg-white ${cardBorderClass}`}>
            <div className="flex justify-between items-start mb-2">
                <div>
                    <h3 className="font-bold text-lg text-gray-900">{job.title}</h3>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                        <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-full font-medium">{job.category}</span>
                        {statusBadge}
                        {applicantBadge}
                    </div>
                </div>
                <div className="text-right"><span className="block font-bold text-indigo-600">₱{job.pay}</span><span className="text-xs text-gray-500">{job.payment_method || 'Cash'}</span></div>
            </div>
            <p className="text-gray-600 text-sm mb-4 line-clamp-2">{job.description}</p>
            <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center"><span className="mr-3">📍 {job.location}</span><span>🕒 {job.duration}</span></div>
                {job.status === 'completed' && job.rating && (<div className="flex items-center text-amber-500"><span className="mr-1 font-bold">{job.rating}</span><svg className="w-3 h-3 fill-current" viewBox="0 0 24 24"><path d={ICONS.Star} /></svg></div>)}
                {applicationStatus && (<span className={`px-2 py-1 rounded font-bold capitalize ${applicationStatus === 'approved' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{applicationStatus}</span>)}
            </div>
        </div>
    );
};

const Dashboard = ({ user, activeJobs, onSelectJob }) => {
    const actionRequired = activeJobs.filter(j => 
        j.status === 'done_pending' || 
        j.status === 'payment_verification' || 
        (user.role == 2 && j.status === 'in_progress') ||
        (user.role == 1 && j.status === 'completed' && !j.rating) 
    );
    const inProgress = activeJobs.filter(j => j.status === 'in_progress' && user.role == 1);
    const newApplicants = activeJobs.filter(j => j.status === 'open' && j.applicant_count > 0 && user.role == 1);
    const completed = activeJobs.filter(j => j.status === 'completed');
    
    if (activeJobs.length === 0 && user.role === 1) return null;

    return (
        <div className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center"><Icon path={ICONS.Briefcase} className="w-6 h-6 mr-2 text-indigo-600" /> {user.role == 1 ? "Employer Dashboard" : "My Current Gigs"}</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm"><span className="block text-gray-500 text-xs font-bold uppercase">Active</span><span className="text-2xl font-bold text-indigo-600">{activeJobs.filter(j=>['in_progress','done_pending','payment_verification'].includes(j.status)).length}</span></div>
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm"><span className="block text-gray-500 text-xs font-bold uppercase">Completed</span><span className="text-2xl font-bold text-green-600">{completed.length}</span></div>
            </div>

            {newApplicants.length > 0 && (
                <div className="mb-8">
                    <div className="flex items-center mb-4"><div className="w-3 h-3 bg-red-500 rounded-full mr-2 animate-ping"></div><h3 className="text-lg font-bold text-gray-800">New Applicants!</h3></div>
                    <div className="grid md:grid-cols-2 gap-4">{newApplicants.map(job => (<JobCard key={job.id} job={job} onClick={() => onSelectJob(job)} />))}</div>
                </div>
            )}

            {actionRequired.length > 0 && (<div className="mb-8"><div className="flex items-center mb-4"><div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div><h3 className="text-lg font-bold text-gray-800">Action Required</h3></div><div className="grid md:grid-cols-2 gap-4">{actionRequired.map(job => (<JobCard key={job.id} job={job} onClick={() => onSelectJob(job)} />))}</div></div>)}
            {inProgress.length > 0 && (<div className="mb-8"><h3 className="text-lg font-bold text-gray-800 mb-4">In Progress</h3><div className="grid md:grid-cols-2 gap-4">{inProgress.map(job => (<JobCard key={job.id} job={job} onClick={() => onSelectJob(job)} />))}</div></div>)}
            <hr className="border-gray-200" />
        </div>
    );
};

const JobDetails = ({ job, onBack, onApply, user, applicants, isOwner, onApprove, onMarkDone, onConfirmComplete, onReport, onRateEmployer, onUploadPayment, onVerifyPayment, hasApplied }) => { 
    const isJobClosed = job.status === 'closed' || job.status === 'completed' || job.status === 'disputed';
    const isWorkerHired = user && user.role == 2 && job.worker_id == user.id; 

    return ( 
        <div className="max-w-4xl mx-auto p-4"> 
            <button onClick={onBack} className="mb-6 text-gray-500 hover:text-gray-900 flex items-center">← Back to List</button> 
            {job.status === 'in_progress' && <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4 text-blue-700"><strong>Gig In Progress:</strong> The worker has been hired.</div>}
            {job.status === 'done_pending' && <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-4 text-yellow-700"><strong>Work Finished:</strong> Worker has marked this as done. Upload payment proof.</div>}
            {job.status === 'payment_verification' && <div className="bg-purple-50 border-l-4 border-purple-500 p-4 mb-4 text-purple-700"><strong>Payment Sent:</strong> Waiting for worker to verify receipt.</div>}
            {job.status === 'completed' && <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4 text-green-700"><strong>Completed:</strong> This gig has been successfully finished and paid.</div>}
            {job.status === 'disputed' && <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4 text-red-700"><strong>Disputed:</strong> This gig has been reported to admins.</div>}

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"> 
                <div className="p-8 border-b border-gray-100"> 
                    <div className="flex justify-between items-center"><span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-medium">{job.category}</span>{isJobClosed && <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-bold capitalize">{job.status}</span>}</div> 
                    <h1 className="text-3xl font-bold text-gray-900 mt-4 mb-2">{job.title}</h1> 
                    <p className="text-gray-500 text-sm">Posted on {new Date(job.created_at).toLocaleDateString()}</p> 
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8"><div><span className="block text-gray-400 text-xs uppercase tracking-wide mb-1">Pay</span><span className="text-amber-500 font-bold text-xl">₱{job.pay}</span></div><div><span className="block text-gray-400 text-xs uppercase tracking-wide mb-1">Method</span><span className="font-medium text-gray-900">{job.payment_method || 'Cash'}</span></div><div><span className="block text-gray-400 text-xs uppercase tracking-wide mb-1">Duration</span><span className="font-medium text-gray-900">{job.duration}</span></div><div><span className="block text-gray-400 text-xs uppercase tracking-wide mb-1">Location</span><span className="font-medium text-gray-900">{job.location}</span></div></div> 
                </div> 
                <div className="p-8 bg-gray-50/50"> 
                    <h3 className="font-bold text-gray-900 mb-3">Gig Description</h3><p className="text-gray-600 leading-relaxed mb-8">{job.description}</p><h3 className="font-bold text-gray-900 mb-4">About the Employer</h3><div className="flex items-center mb-8"><img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(job.employer_name)}`} className="w-12 h-12 rounded-full bg-white border mr-4" /><div><p className="font-bold text-gray-900">{job.employer_name}</p><div className="flex items-center text-yellow-500 text-sm"><span>★ 4.8 average rating</span></div></div></div> 
                    {isOwner && (
                        <div className="space-y-4">
                            {job.status === 'in_progress' && (<div className="p-4 bg-white rounded border border-gray-200 shadow-sm"><h4 className="font-bold text-gray-900 mb-2">Manage Active Gig</h4><p className="mb-4 text-sm text-gray-600">The worker is currently doing the task.</p><button onClick={onReport} className="text-red-600 font-bold text-sm underline">Report Problem</button></div>)}
                            {job.status === 'done_pending' && (<div className="p-6 bg-yellow-50 rounded-xl border border-yellow-200"><h4 className="font-bold text-yellow-900 mb-2 text-lg">Worker Marked as Done!</h4><p className="mb-4 text-sm text-yellow-800">Please pay the worker and upload the receipt proof.</p><div className="flex flex-col md:flex-row gap-4"><button onClick={onUploadPayment} className="flex-1 bg-green-600 text-white font-bold py-3 rounded-xl hover:bg-green-700 transition shadow-lg shadow-green-200">Upload Payment Proof</button><button onClick={onReport} className="px-6 py-3 border border-red-200 text-red-600 font-bold rounded-xl hover:bg-red-50 bg-white">Report Issue</button></div></div>)}
                            {job.status === 'payment_verification' && (<div className="p-6 bg-purple-50 rounded-xl border border-purple-200"><h4 className="font-bold text-purple-900 mb-2 text-lg">Payment Sent</h4><p className="mb-4 text-sm text-purple-800">Waiting for the worker to confirm they received it. They will rate you soon.</p><div className="mt-4"><img src={`${API_BASE_PATH}/uploads/${job.payment_proof}`} alt="Proof" className="max-w-xs rounded border" /></div></div>)}
                            {job.status === 'completed' && !job.rating && (
                                <div className="p-6 bg-green-50 rounded-xl border border-green-200 text-center">
                                    <h4 className="font-bold text-green-900 mb-2">Gig Closed</h4>
                                    <p className="mb-4 text-sm text-green-800">You haven't rated the worker yet!</p>
                                    <button onClick={onConfirmComplete} className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-indigo-700">Rate Worker</button>
                                </div>
                            )}
                        </div>
                    )}
                    {user && user.role == 2 && (
                         <>
                            {!isOwner && !isWorkerHired && job.status === 'open' && !hasApplied && (<button onClick={() => onApply(job.id)} className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-200">Apply Now</button>)}
                            {!isOwner && !isWorkerHired && job.status === 'open' && hasApplied && (<div className="w-full bg-gray-100 text-gray-600 font-bold py-4 rounded-xl text-center border border-gray-200">Application Pending</div>)}
                            {isWorkerHired && (
                                <div className="space-y-3">
                                    {job.status === 'in_progress' && (<div className="p-6 bg-blue-50 rounded-xl border border-blue-200"><h4 className="font-bold text-blue-900 mb-2 text-lg">You are Hired!</h4><p className="mb-4 text-sm text-blue-800">Once finished, click below.</p><button onClick={onMarkDone} className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-200">Mark as Done</button><div className="text-center mt-4"><button onClick={onReport} className="text-red-600 text-sm underline">Report Employer</button></div></div>)}
                                    {job.status === 'done_pending' && (<div className="text-center p-6 bg-yellow-50 rounded-xl border border-yellow-200 text-yellow-800"><h4 className="font-bold mb-2">Good Job!</h4><p>Waiting for employer to pay and upload proof.</p><button onClick={onReport} className="text-red-600 text-sm underline mt-2">Report Employer (Did not pay)</button></div>)}
                                    {job.status === 'payment_verification' && (
                                        <div className="p-6 bg-purple-50 rounded-xl border border-purple-200">
                                            <h4 className="font-bold text-purple-900 mb-2 text-lg">Payment Proof Uploaded</h4>
                                            <p className="mb-4 text-sm text-purple-800">The employer has sent payment. Please verify the receipt below.</p>
                                            <div className="mb-6 bg-white p-2 rounded border"><img src={`${API_BASE_PATH}/uploads/${job.payment_proof}`} alt="Proof" className="w-full rounded" /></div>
                                            <button onClick={onVerifyPayment} className="w-full bg-green-600 text-white font-bold py-3 rounded-xl hover:bg-green-700 transition shadow-lg shadow-green-200">Confirm Payment Received</button>
                                            <div className="text-center mt-4"><button onClick={onReport} className="text-red-600 text-sm underline">Report Fake Receipt</button></div>
                                        </div>
                                    )}
                                    {job.status === 'completed' && !job.employer_rating && (
                                        <div className="p-6 bg-green-50 rounded-xl border border-green-200 text-center"><h4 className="font-bold text-green-900 mb-2">Gig Closed</h4><p className="mb-4 text-sm text-green-800">Don't forget to rate your employer!</p><button onClick={onRateEmployer} className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-indigo-700">Rate Employer</button></div>
                                    )}
                                </div>
                            )}
                         </>
                    )}
                    {!user && job.status === 'open' && (<div className="text-center text-gray-500 italic bg-gray-100 p-4 rounded">Please Login to Apply</div>)} 
                </div> 
            </div> 
            {isOwner && job.status === 'open' && ( <div className="mt-8"> <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center"><Icon path={ICONS.Users} className="w-6 h-6 mr-3 text-indigo-600" /> Applicants</h2> <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"> {applicants && applicants.length > 0 ? ( <ul className="divide-y divide-gray-100">{applicants.map((applicant) => ( <li key={applicant.application_id} className="p-6 flex justify-between items-center"> <div className="flex items-center"><img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(applicant.name)}`} className="w-10 h-10 rounded-full mr-4" /><div><p className="font-bold text-gray-900">{applicant.name}</p><p className="text-sm text-gray-500">{applicant.barangay}</p></div></div> <div className="text-right"> {applicant.status === 'approved' && <span className="text-sm font-bold text-green-600 bg-green-100 px-3 py-1 rounded-full">Hired</span>} {applicant.status === 'rejected' && <span className="text-sm font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">Not Selected</span>} {applicant.status === 'pending' && <button onClick={() => onApprove(applicant.application_id, job.id, applicant.user_id)} className="bg-green-500 text-white px-4 py-2 text-sm font-semibold rounded-lg hover:bg-green-600 transition">Approve</button>} </div> </li> ))}</ul> ) : (<p className="text-gray-500 p-8 text-center">No one has applied to this gig yet.</p>)} </div> </div> )} 
            {job.status === 'completed' && (
                <div className="mt-8 grid md:grid-cols-2 gap-4">
                    {job.review && <div className="bg-white p-6 rounded-xl border border-gray-100"><h3 className="font-bold text-gray-500 text-sm uppercase mb-2">Worker Rating</h3><div className="flex items-center mb-2"><StarRating rating={job.rating || 5} interactive={false} /><span className="ml-2 font-bold text-gray-900">{job.rating}/5</span></div><p className="text-gray-600 italic">"{job.review}"</p></div>}
                    {job.employer_review && <div className="bg-white p-6 rounded-xl border border-gray-100"><h3 className="font-bold text-gray-500 text-sm uppercase mb-2">Employer Rating</h3><div className="flex items-center mb-2"><StarRating rating={job.employer_rating || 5} interactive={false} /><span className="ml-2 font-bold text-gray-900">{job.employer_rating}/5</span></div><p className="text-gray-600 italic">"{job.employer_review}"</p></div>}
                </div>
            )}
        </div> 
    );
};

const AuthPage = ({ type, onAuth, setPage }) => { 
    const [formData, setFormData] = useState({ username: '', password: '', name: '', role: 'worker', barangay: 'Agusan' }); // Default to Agusan
    const [error, setError] = useState(''); 
    const handleSubmit = async (e) => { 
        e.preventDefault(); setError(''); 
        const endpoint = type === 'login' ? '/api/login' : '/api/signup'; 
        try { 
            const res = await api.post(endpoint, formData); 
            if (res.status === 'true') { 
                if (type === 'signup') { alert("Account created! Please login."); setPage('login'); } else { onAuth(res); } 
            } else { setError(res.message || 'Authentication failed'); } 
        } catch (err) { setError('A network error occurred.'); } 
    }; 
    return ( 
        <div className="min-h-[calc(100vh-64px)] flex items-center justify-center py-12 px-4"> 
            <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-lg border border-gray-100"> 
                <div className="text-center"> <h2 className="mt-6 text-3xl font-extrabold text-gray-900">{type === 'login' ? 'Sign in to your account' : 'Create an account'}</h2> <p className="mt-2 text-sm text-gray-600">{type === 'login' ? 'Or ' : 'Already have an account? '}<a href="#" onClick={(e) => { e.preventDefault(); setPage(type === 'login' ? 'signup' : 'login'); }} className="font-medium text-indigo-600 hover:text-indigo-500">{type === 'login' ? 'create a new account' : 'Sign in'}</a></p> </div> 
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {type === 'signup' && (<> 
                        <div className="grid grid-cols-2 gap-4 mb-4"> <button type="button" className={`p-3 rounded-lg border text-center font-medium ${formData.role === 'worker' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-500 border-gray-200'}`} onClick={() => setFormData({...formData, role: 'worker'})}>Worker</button> <button type="button" className={`p-3 rounded-lg border text-center font-medium ${formData.role === 'employer' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-500 border-gray-200'}`} onClick={() => setFormData({...formData, role: 'employer'})}>Employer</button> </div> 
                        <input type="text" placeholder="Full Name" className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-600 focus:border-indigo-600 sm:text-sm mb-4" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required /> 
                        {/* REPLACED INPUT WITH DROPDOWN */}
                        <div className="mb-4">
                            <select className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-600 focus:border-indigo-600 sm:text-sm" value={formData.barangay} onChange={e => setFormData({...formData, barangay: e.target.value})} required>
                                {CDO_BARANGAYS.map(b => <option key={b} value={b}>{b}</option>)}
                            </select>
                        </div>
                    </>)}
                    <input type="email" placeholder="Email address" className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-600 focus:border-indigo-600 sm:text-sm mb-4" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} required /> 
                    <input type="password" placeholder="Password" className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-600 focus:border-indigo-600 sm:text-sm mb-4" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required />
                    {error && <div className="text-red-500 text-sm text-center">{error}</div>}
                    <button type="submit" className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-lg shadow-indigo-200">{type === 'login' ? 'Sign in' : 'Sign up'}</button>
                </form> 
            </div> 
        </div> 
    ); 
};

// UPDATED POST JOB PAGE WITH DROPDOWN AND SPECIFIC ADDRESS
const PostJob = ({ onSuccess }) => { 
    const [formData, setFormData] = useState({ title: '', category: 'Household Chores', description: '', pay: '', duration: '' }); 
    const [barangay, setBarangay] = useState('Agusan');
    const [specificAddress, setSpecificAddress] = useState('');

    const handleSubmit = async (e) => { 
        e.preventDefault(); 
        // COMBINE DATA FOR SUBMISSION
        const finalData = {
            ...formData,
            location: barangay, // Stores only the Barangay for clean filtering
            description: `[Location: ${specificAddress}]\n\n${formData.description}` // Appends specific details to description
        };

        const res = await api.post('/api/jobs', finalData); 
        if(res.status === 'true') { onSuccess(); } else { alert(res.message || "Failed to post gig"); } 
    }; 
    
    return (
        <div className="max-w-2xl mx-auto py-12 px-4">
            <h1 className="text-3xl font-bold mb-8">Post a New Gig</h1>
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 space-y-6">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Gig Title</label><input type="text" placeholder="e.g., General House Cleaning" className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Category</label><select className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none bg-white" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>{Categories.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                
                {/* NEW LOCATION FIELDS */}
                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Barangay</label>
                        <select className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none bg-white" value={barangay} onChange={e => setBarangay(e.target.value)}>
                            {CDO_BARANGAYS.map(b => <option key={b} value={b}>{b}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Specific Address / Landmark</label>
                        <input type="text" placeholder="e.g., Zone 5, near Chapel" className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none" value={specificAddress} onChange={e => setSpecificAddress(e.target.value)} required />
                    </div>
                </div>

                <div><label className="block text-sm font-medium text-gray-700 mb-1">Description</label><textarea placeholder="Describe the task in detail..." rows={4} className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} required /></div>
                <div className="grid grid-cols-2 gap-6"><div><label className="block text-sm font-medium text-gray-700 mb-1">Pay (in PHP)</label><input type="number" placeholder="e.g., 500" className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none" value={formData.pay} onChange={e => setFormData({...formData, pay: e.target.value})} required /></div><div><label className="block text-sm font-medium text-gray-700 mb-1">Estimated Duration</label><input type="text" placeholder="e.g., Approx. 3 hours" className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none" value={formData.duration} onChange={e => setFormData({...formData, duration: e.target.value})} /></div></div>
                <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700 transition">Post Gig</button>
            </form>
        </div>
    ); 
};

const MyJobsPage = ({ myJobs, onSelectJob }) => { const openJobs = myJobs.filter(j => j.status === 'open'); const closedJobs = myJobs.filter(j => j.status === 'closed'); return (<div className="max-w-6xl mx-auto px-4 py-12"> <h2 className="text-2xl font-bold text-gray-900 mb-2">My Active Postings</h2> <p className="text-gray-500 mb-8">These gigs are currently open for applications.</p> {openJobs.length === 0 ? ( <div className="text-center py-12 text-gray-500 bg-white rounded-lg border">You have no active gig postings.</div> ) : ( <div className="space-y-4">{openJobs.map(job => <JobCard key={job.id} job={job} onClick={() => onSelectJob(job)} />)}</div> )} <hr className="my-12"/> <h2 className="text-2xl font-bold text-gray-900 mb-2">Gig History</h2> <p className="text-gray-500 mb-8">These gigs are closed.</p> {closedJobs.length === 0 ? ( <div className="text-center py-12 text-gray-500 bg-white rounded-lg border">You have no past gigs.</div> ) : ( <div className="space-y-4">{closedJobs.map(job => <JobCard key={job.id} job={job} onClick={() => onSelectJob(job)} />)}</div> )} </div>); };
const MyApplicationsPage = ({ myApplications, onSelectJob }) => ( <div className="max-w-6xl mx-auto px-4 py-12"> <h2 className="text-2xl font-bold text-gray-900 mb-2">My Applications</h2> <p className="text-gray-500 mb-8">Here are the gigs you've applied for and their status.</p> {myApplications.length === 0 ? ( <div className="text-center py-12 text-gray-500 bg-white rounded-lg border">You haven't applied to any gigs yet.</div> ) : ( <div className="space-y-4">{myApplications.map(app => <JobCard key={app.id} job={app} onClick={() => onSelectJob(app)} applicationStatus={app.application_status} />)}</div> )} </div> );

const ProfilePage = ({ user, onSuccess }) => {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const handleSubmit = async (e) => { e.preventDefault(); if(!file) return alert("Please select a photo"); const formData = new FormData(); formData.append('document', file); setUploading(true); try { const response = await fetch(API_BASE_PATH + '/api/verify', { method: 'POST', body: formData }); const res = await response.json(); if(res.status === 'true') { alert("Success! You are now Verified."); onSuccess(); } else { alert(res.message || "Upload failed"); } } catch (err) { alert("Error uploading file"); } finally { setUploading(false); } };
    return ( <div className="max-w-4xl mx-auto py-12 px-4"> <h1 className="text-3xl font-bold text-gray-900 mb-8">My Profile</h1> <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"> <div className="p-8 border-b border-gray-100 bg-gray-50 flex items-center justify-between"> <div className="flex items-center"> <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-2xl font-bold mr-6"> {user.name.charAt(0)} </div> <div> <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2> <p className="text-gray-500 capitalize">{user.role == 1 ? 'Employer' : (user.role == 3 ? 'Admin' : 'Worker')}</p> </div> </div> <div> {user.verification_status === 'verified' ? ( <span className="bg-green-100 text-green-700 px-4 py-2 rounded-full font-bold flex items-center"> <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg> Verified Account </span> ) : ( <span className="bg-gray-100 text-gray-600 px-4 py-2 rounded-full font-bold flex items-center"> Unverified </span> )} </div> </div> <div className="p-8"> {user.verification_status === 'verified' ? ( <div className="text-center py-8"> <p className="text-green-600 font-medium text-lg">You are fully verified!</p> <p className="text-gray-500">You have full access to post gigs and apply.</p> </div> ) : ( <div className="max-w-lg"> <h3 className="text-xl font-bold text-gray-900 mb-4">Verify Your Account</h3> <p className="text-gray-600 mb-6">To ensure the safety of our community, please upload a photo of a valid Government ID or Barangay ID.</p> <form onSubmit={handleSubmit} className="space-y-4"> <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:bg-gray-50 transition"> <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700" /> </div> <button disabled={uploading} type="submit" className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-indigo-700 transition disabled:opacity-50"> {uploading ? 'Uploading...' : 'Submit Verification'} </button> </form> </div> )} </div> </div> </div> );
};

const App = () => {
    const [page, setPage] = useState('home');
    const [user, setUser] = useState(null);
    const [selectedJob, setSelectedJob] = useState(null);
    const [jobs, setJobs] = useState([]);
    const [myJobs, setMyJobs] = useState([]); 
    const [myApplications, setMyApplications] = useState([]); 
    const [applicants, setApplicants] = useState([]);
    const [search, setSearch] = useState('');
    const [filterCat, setFilterCat] = useState('All Categories');
    const [filterLoc, setFilterLoc] = useState('All Locations');
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [isWorkerRating, setIsWorkerRating] = useState(false);

    useEffect(() => { checkAuth(); fetchJobs(); }, []);
    const checkAuth = async () => { try { const res = await api.get('/api/me'); if (res.logged_in) { setUser({ id: res.user_id, role: res.role, name: res.name, verification_status: res.verification_status }); if (res.role == 1) fetchMyJobs(); if (res.role == 2) fetchMyApplications(); } } catch (e) {} };
    const fetchJobs = async () => { try { const data = await api.get('/api/jobs'); if (Array.isArray(data)) setJobs(data); } catch (e) {} };
    const fetchMyJobs = async () => { try { const data = await api.get('/api/my-jobs'); if (Array.isArray(data)) setMyJobs(data); } catch (e) {} };
    const fetchApplicants = async (jobId) => { try { const data = await api.get(`/api/jobs/${jobId}/applicants`); if (Array.isArray(data)) setApplicants(data); } catch(e) {} };
    const fetchMyApplications = async () => { try { const data = await api.get('/api/my-applications'); if (Array.isArray(data)) setMyApplications(data); } catch(e) {} };
    const handleSelectJob = (job) => { setSelectedJob(job); if (user && user.id == job.employer_id) { fetchApplicants(job.id); } window.scrollTo(0, 0); };
    const handleLogout = async () => { await api.post('/api/logout', {}); setUser(null); setPage('home'); setSelectedJob(null); setApplicants([]); setMyJobs([]); setMyApplications([]); };
    const handleApply = async (jobId) => { const res = await api.post(`/api/jobs/${jobId}/apply`, {}); if(res.status === 'true') { alert("Applied Successfully!"); setPage('home'); setSelectedJob(null); } else { alert(res.message || "Failed to apply"); } };
    const handleApprove = async (applicationId, jobId, workerId) => { if (!confirm("Are you sure you want to hire this person?")) return; const updatedJob = { ...selectedJob, status: 'in_progress', worker_id: workerId }; setSelectedJob(updatedJob); fetchMyJobs(); fetchJobs(); await api.post(`/api/applications/${applicationId}/approve`, {}); alert("Applicant Hired! Gig is now In Progress."); fetchApplicants(jobId); };
    const handleMarkDone = async () => { if(!confirm("Have you finished the work?")) return; const updatedJob = { ...selectedJob, status: 'done_pending' }; setSelectedJob(updatedJob); setMyApplications(myApplications.map(j => j.id === selectedJob.id ? updatedJob : j)); await api.post(`/api/jobs/${selectedJob.id}/mark-done`, {}); };
    const handleUploadPayment = () => { setShowPaymentModal(true); };
    const handleSubmitPayment = async (file) => {
        const formData = new FormData();
        formData.append('proof', file);
        const res = await fetch(`${API_BASE_PATH}/api/jobs/${selectedJob.id}/submit-payment`, { method: 'POST', body: formData });
        const result = await res.json();
        if(result.status === 'true') {
            // FIX: Use real filename from server
            const updatedJob = { ...selectedJob, status: 'payment_verification', payment_proof: result.file };
            setSelectedJob(updatedJob);
            setMyJobs(myJobs.map(j => j.id === selectedJob.id ? updatedJob : j));
            setShowPaymentModal(false);
            alert("Payment Proof Uploaded! Waiting for worker verification.");
            fetchMyJobs(); // Refresh to get real image path
        } else {
            alert(result.message || "Upload failed");
        }
    };

    const handleVerifyPayment = async () => {
        if(!confirm("I confirm that I have received the correct payment.")) return;
        setIsWorkerRating(true); // Open rating modal immediately after
        const updatedJob = { ...selectedJob, status: 'completed' };
        setSelectedJob(updatedJob);
        setMyApplications(myApplications.map(j => j.id === selectedJob.id ? updatedJob : j));
        await api.post(`/api/jobs/${selectedJob.id}/confirm-payment`, {});
        setShowReviewModal(true);
    };
    const handleConfirmComplete = () => { setIsWorkerRating(false); setShowReviewModal(true); };
    const handleRateEmployer = () => { setIsWorkerRating(true); setShowReviewModal(true); };
    const handleSubmitReview = async ({ stars, comment }) => {
        if (isWorkerRating) {
            const updatedJob = { ...selectedJob, employer_rating: stars, employer_review: comment };
            setSelectedJob(updatedJob);
            setMyApplications(myApplications.map(j => j.id === selectedJob.id ? updatedJob : j));
            await api.post(`/api/jobs/${selectedJob.id}/rate-employer`, { rating: stars, review: comment });
            alert("Employer Rated!");
        } else {
            const updatedJob = { ...selectedJob, status: 'completed', rating: stars, review: comment };
            setSelectedJob(updatedJob);
            setMyJobs(myJobs.map(j => j.id === selectedJob.id ? updatedJob : j));
            await api.post(`/api/jobs/${selectedJob.id}/complete`, { rating: stars, review: comment });
            alert("Gig Completed & Reviewed!");
        }
        setShowReviewModal(false);
    };
    const handleReport = () => { setShowReportModal(true); };
    const handleSubmitReport = async (reason) => { const updatedJob = { ...selectedJob, status: 'disputed' }; setSelectedJob(updatedJob); setShowReportModal(false); await api.post(`/api/jobs/${selectedJob.id}/report`, { reason }); alert("Report submitted. Admins will review this gig."); };
    const handleResolveDispute = async (jobId) => { if(!confirm("Mark this dispute as resolved and close the gig?")) return; await api.post(`/api/admin/jobs/${jobId}/resolve`, {}); alert("Dispute resolved."); window.location.reload(); };

    useEffect(() => { if (user && user.role == 1 && page === 'my-jobs') { fetchMyJobs(); } }, [user, page]);
    useEffect(() => { if (user && user.role == 2 && page === 'my-apps') { fetchMyApplications(); } }, [user, page]);

    const uniqueLocations = [...new Set(jobs.map(job => job.location))].sort();
    const filteredJobs = jobs.filter(j => (j.title.toLowerCase().includes(search.toLowerCase()) || j.description.toLowerCase().includes(search.toLowerCase())) && (filterCat === 'All Categories' || j.category === filterCat) && (filterLoc === 'All Locations' || j.location === filterLoc));

    let content;
    
    // CALCULATE IF APPLIED
    const hasApplied = user && user.role === 2 && selectedJob ? myApplications.some(app => app.id === selectedJob.id) : false;

    if (page === 'admin') content = <AdminDashboard onResolve={handleResolveDispute} />;
    else if (selectedJob) content = <JobDetails job={selectedJob} onBack={() => { setSelectedJob(null); setApplicants([]); }} onApply={handleApply} user={user} applicants={applicants} isOwner={user && user.id == selectedJob.employer_id} onApprove={handleApprove} onMarkDone={handleMarkDone} onConfirmComplete={handleConfirmComplete} onReport={handleReport} onRateEmployer={handleRateEmployer} onUploadPayment={handleUploadPayment} onVerifyPayment={handleVerifyPayment} hasApplied={hasApplied} />;
    else if (page === 'login') content = <AuthPage type="login" onAuth={(u) => { checkAuth(); setPage('home'); }} setPage={setPage} />; 
    else if (page === 'signup') content = <AuthPage type="signup" onAuth={() => {}} setPage={setPage} />; 
    else if (page === 'profile') content = user ? <ProfilePage user={user} onSuccess={() => { checkAuth(); }} /> : <AuthPage type="login" onAuth={(u) => { checkAuth(); setPage('profile'); }} setPage={setPage} />;
    else if (page === 'post-job') { if (!user || user.role != 1) content = <AuthPage type="login" onAuth={(u) => { checkAuth(); setPage('post-job'); }} setPage={setPage} />; else if (user.verification_status !== 'verified') content = <ProfilePage user={user} onSuccess={() => { checkAuth(); setPage('post-job'); }} />; else content = <PostJob onSuccess={() => { fetchJobs(); fetchMyJobs(); setPage('my-jobs'); }} />; }
    else if (page === 'my-jobs') { content = (!user || user.role != 1) ? <AuthPage type="login" onAuth={(u) => { checkAuth(); setPage('my-jobs'); }} setPage={setPage} /> : <MyJobsPage myJobs={myJobs} onSelectJob={handleSelectJob} />; }
    else if (page === 'my-apps') { content = (!user || user.role != 2) ? <AuthPage type="login" onAuth={(u) => { checkAuth(); setPage('my-apps'); }} setPage={setPage} /> : <MyApplicationsPage myApplications={myApplications} onSelectJob={handleSelectJob} />; }
    else { content = ( <> {!user && <Hero onFindJobsClick={() => document.getElementById('job-list-section')?.scrollIntoView({ behavior: 'smooth' })} setPage={setPage} />} {!user && <HowItWorks />} <div id="job-list-section" className="max-w-6xl mx-auto px-4 py-12"> {user && <Dashboard user={user} activeJobs={user.role == 1 ? myJobs : myApplications} onSelectJob={handleSelectJob} />} <h2 className="text-2xl font-bold text-gray-900 mt-4">Featured Local Gigs</h2> <p className="text-gray-500 mb-8">Find tasks posted by your neighbors.</p> <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-8 grid md:grid-cols-4 gap-4"> <div className="md:col-span-2 relative"><Icon path={ICONS.Search} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" /><input type="text" placeholder="Search for gigs..." className="w-full pl-10 p-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-1 focus:ring-indigo-600" value={search} onChange={e => setSearch(e.target.value)} /></div> <div><select className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-1 focus:ring-indigo-600 text-gray-600" value={filterCat} onChange={e => setFilterCat(e.target.value)}><option>All Categories</option>{Categories.map(c => <option key={c} value={c}>{c}</option>)}</select></div> <div><select className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-1 focus:ring-indigo-600 text-gray-600" value={filterLoc} onChange={e => setFilterLoc(e.target.value)}><option>All Locations</option>{uniqueLocations.map(l => <option key={l} value={l}>{l}</option>)}</select></div> </div> {filteredJobs.length === 0 ? (<div className="text-center py-12 text-gray-500">No gigs found matching your criteria.</div>) : (<div className="space-y-4">{filteredJobs.map(job => (<JobCard key={job.id} job={job} onClick={() => handleSelectJob(job)} />))}</div>)} </div> </> ); }

    return ( <div className="min-h-screen bg-gray-50 font-sans text-gray-900"> <Navbar user={user} onLogout={handleLogout} setPage={(p) => { setPage(p); setSelectedJob(null); setApplicants([]); }} /> {content} <ReviewModal isOpen={showReviewModal} onClose={() => setShowReviewModal(false)} onSubmit={handleSubmitReview} isWorkerRatingEmployer={isWorkerRating} /> <ReportModal isOpen={showReportModal} onClose={() => setShowReportModal(false)} onSubmit={handleSubmitReport} /> <PaymentModal isOpen={showPaymentModal} onClose={() => setShowPaymentModal(false)} onSubmit={handleSubmitPayment} /> </div> );
};

const root = createRoot(document.getElementById('root'));
root.render(<App />);
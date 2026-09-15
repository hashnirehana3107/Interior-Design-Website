import React from 'react';
import { IoClose } from 'react-icons/io5';
import { TbMapPin, TbBriefcase, TbClock, TbCheck, TbArrowRight, TbSparkles } from 'react-icons/tb';
import './JobDetailModal.css';

const JOB_DETAILS_DATA = {
    'Interior Designer': {
        title: 'Interior Designer',
        department: 'Design & Architecture',
        type: 'Full-time',
        location: 'Colombo, Sri Lanka',
        experience: '2 - 4 Years Experience',
        salaryRange: 'Negotiable (Based on Experience)',
        overview: 'We are seeking a talented and passionate Interior Designer to join our luxury interior architecture studio in Colombo. You will collaborate directly with our lead architects to turn client visions into breathtaking residential and commercial living spaces.',
        responsibilities: [
            'Develop luxury interior concepts, space planning, color palettes, and material selections for high-end projects.',
            'Create detailed presentation boards, material moodboards, and client presentation packages.',
            'Coordinate with suppliers, furniture vendors, and craftsmen for custom millwork and FF&E specification.',
            'Conduct site visits, field measurements, and ensure design implementation matches client specifications.',
            'Work closely with 3D visualizers and project managers from concept design to final handover.'
        ],
        requirements: [
            'Bachelor’s Degree or Higher Diploma in Interior Design or Architecture.',
            'Minimum 2-4 years of proven experience in luxury residential or commercial interior projects.',
            'Proficiency in AutoCAD, SketchUp, Photoshop, and InDesign.',
            'Strong knowledge of materials, fabrics, lighting, and custom furniture construction.',
            'Excellent communication, aesthetic eye, and attention to luxury detailing.'
        ],
        benefits: [
            'Competitive salary package with project completion bonuses.',
            'Opportunity to work on award-winning luxury residential and hospitality projects.',
            'Continuous professional growth, training workshops, and design expo visits.',
            'Collaborative and supportive team culture in a modern studio environment.'
        ]
    },

    'Interior Architect': {
        title: 'Interior Architect',
        department: 'Architecture & Engineering',
        type: 'Full-time',
        location: 'Colombo, Sri Lanka',
        experience: '3 - 5 Years Experience',
        salaryRange: 'Negotiable (Based on Portfolio)',
        overview: 'Good Interior Design Studio is looking for a experienced Interior Architect to oversee technical drawings, structural interior modifications, ceiling & lighting plans, and detailed architectural joinery for high-end developments.',
        responsibilities: [
            'Prepare comprehensive architectural working drawing sets, MEP coordination drawings, and joinery details.',
            'Design structural interior alterations, staircase details, wall paneling, and custom ceiling layouts.',
            'Review architectural codes, local building regulations, and structural feasibility.',
            'Coordinate with structural engineers, MEP consultants, and site contractors.',
            'Lead technical design reviews and maintain rigorous quality control on construction sites.'
        ],
        requirements: [
            'Degree in Architecture or Interior Architecture (SLIA / RIBA registered preferred).',
            '3+ years of professional architectural practice specializing in interior structures.',
            'Advanced proficiency in AutoCAD, Revit, and BIM software.',
            'In-depth knowledge of building codes, electrical/plumbing layouts, and joinery construction.',
            'Strong leadership skills and ability to manage technical project documentation.'
        ],
        benefits: [
            'Attractive remuneration package and performance incentives.',
            'Key role in prestige architectural developments in Colombo and coastal resorts.',
            'Flexible working arrangements and professional license fee support.',
            'Exposure to international luxury design standards.'
        ]
    },

    '3D Visualizer': {
        title: '3D Visualizer',
        department: 'Visual Arts & Rendering',
        type: 'Full-time',
        location: 'Colombo, Sri Lanka',
        experience: '1 - 3 Years Experience',
        salaryRange: 'Competitive',
        overview: 'Are you a master of light, texture, and photorealistic 3D rendering? We are hiring a 3D Visualizer to bring our luxury architectural concepts to vivid life before construction begins.',
        responsibilities: [
            'Produce photorealistic 3D interior and exterior CGI renderings, animation walkthroughs, and VR presentations.',
            'Model intricate interior furniture, lighting fixtures, custom joinery, and realistic material textures.',
            'Work closely with interior designers to accurately translate 2D layouts into 3D environments.',
            'Perform post-processing and color grading in Photoshop/Corona/V-Ray.',
            'Maintain a structured 3D asset library of luxury furniture and materials.'
        ],
        requirements: [
            'Diploma or Degree in 3D Animation, Multimedia, Architecture, or Interior Design.',
            'Proficiency in 3ds Max / Blender / SketchUp paired with Corona Renderer or V-Ray.',
            'Strong sense of lighting, composition, camera angles, and atmospheric interior realism.',
            'Portfolio showcasing photorealistic architectural interior renders.',
            'Ability to meet project deadlines and handle multiple rendering tasks.'
        ],
        benefits: [
            'High-spec workstation with dual monitors and dedicated render farm access.',
            'Creative freedom to experiment with atmospheric lighting and luxury aesthetics.',
            'Performance-based project incentives.',
            'Supportive studio atmosphere with passionate designers.'
        ]
    },

    'Marketing Executive': {
        title: 'Marketing Executive',
        department: 'Brand & Communications',
        type: 'Full-time',
        location: 'Colombo, Sri Lanka',
        experience: '2 - 4 Years Experience',
        salaryRange: 'Competitive + Bonus',
        overview: 'We are seeking a dynamic Marketing Executive to drive Good Interior’s brand presence across digital channels, manage social media campaigns, produce luxury content, and nurture prospective client leads.',
        responsibilities: [
            'Develop and execute integrated digital marketing strategies across Instagram, LinkedIn, Pinterest, and Meta ads.',
            'Curate high-quality visual content, photoshoots, video reels, and client story highlights.',
            'Manage website SEO content, monthly blog articles, and email newsletter campaigns.',
            'Monitor marketing performance metrics, website traffic analytics, and conversion rates.',
            'Organize luxury studio events, press releases, and interior design magazine features.'
        ],
        requirements: [
            'Degree in Marketing, Communications, Digital Media, or Business Administration.',
            '2-4 years experience in brand marketing, preferably within luxury lifestyle, architecture, or real estate.',
            'Proven track record managing social media growth and paid ad campaigns.',
            'Exceptional copywriting skills in English and proficiency in Canva / Adobe Creative Suite.',
            'Strong analytical mindset and understanding of lead generation funnels.'
        ],
        benefits: [
            'Competitive salary with quarterly marketing bonuses.',
            'Opportunity to build a premier luxury brand narrative in Sri Lanka.',
            'Continuous learning budgets for digital marketing certifications.',
            'Friendly, creative, and energetic office culture.'
        ]
    },

    'Project Manager': {
        title: 'Project Manager',
        department: 'Project Execution & Operations',
        type: 'Full-time',
        location: 'Colombo, Sri Lanka',
        experience: '4 - 7 Years Experience',
        salaryRange: 'Senior Salary Package',
        overview: 'We are looking for an assertive Project Manager to lead the execution of our luxury interior projects, managing project timelines, site contractors, procurement, budget adherence, and client communication.',
        responsibilities: [
            'Develop detailed project schedules, gantt charts, material delivery timelines, and budget tracking.',
            'Supervise site contractors, MEP technicians, joiners, and painters to ensure strict design fidelity.',
            'Manage client progress updates, site coordination meetings, and variations approvals.',
            'Conduct quality assurance inspections and resolve site challenges proactively.',
            'Ensure timely project completion, final snagging lists, and client handover.'
        ],
        requirements: [
            'Degree in Project Management, Civil Engineering, Building Economics, or Interior Architecture.',
            '4+ years project management experience in interior fit-out or construction projects.',
            'Strong understanding of MEP systems, joinery details, and procurement timelines.',
            'Exceptional problem-solving, site coordination, and contractor management skills.',
            'PMP certificate or equivalent is an added advantage.'
        ],
        benefits: [
            'Senior tier compensation package with site travel allowances and project bonuses.',
            'Leadership role managing prestigious residential and commercial fit-outs.',
            'Comprehensive health insurance and wellness benefits.',
            'Clear career growth trajectory towards Operations Director.'
        ]
    },

    'Office Administrator': {
        title: 'Office Administrator',
        department: 'Administration & HR',
        type: 'Full-time',
        location: 'Colombo, Sri Lanka',
        experience: '1 - 3 Years Experience',
        salaryRange: 'Attractive Package',
        overview: 'We are seeking an organized and warm Office Administrator to manage day-to-day studio operations, greet clients, assist HR with recruitment, and support team administrative workflows.',
        responsibilities: [
            'Manage front desk operations, answer client inquiries via phone/email, and welcome studio guests.',
            'Handle studio inventory, office supplies, sample library maintenance, and vendor coordination.',
            'Assist HR in job posting, candidate scheduling, and staff onboarding logistics.',
            'Maintain project filing systems, client contracts, invoices, and expense documentation.',
            'Coordinate internal studio meetings, staff birthdays, and team building events.'
        ],
        requirements: [
            'Diploma or Degree in Business Administration, Secretarial Studies, or related field.',
            '1-3 years experience in office administration, front office, or customer relations.',
            'Proficiency in MS Office (Word, Excel, PowerPoint) and Google Workspace.',
            'Excellent verbal and written communication skills in English and Sinhala.',
            'Friendly personality, highly organized, and detail-oriented.'
        ],
        benefits: [
            'Attractive monthly salary and annual performance bonus.',
            'Pleasant luxury studio work environment.',
            'Medical insurance cover and leave benefits.',
            'Supportive team environment with long-term stability.'
        ]
    }
};

const JobDetailModal = ({ isOpen, onClose, jobTitle, jobData, onApplyClick }) => {
    if (!isOpen) return null;

    const job = jobData || JOB_DETAILS_DATA[jobTitle] || JOB_DETAILS_DATA['Interior Designer'];

    return (
        <div className="jdm-backdrop" onClick={onClose}>
            <div className="jdm-container" onClick={(e) => e.stopPropagation()}>
                <button className="jdm-close-btn" onClick={onClose} aria-label="Close position details">
                    <IoClose />
                </button>

                {/* Modal Header */}
                <div className="jdm-header">
                    <div className="jdm-kicker-tag">
                        <TbSparkles className="jdm-sparkle-icon" /> GOOD INTERIOR CAREERS
                    </div>
                    <h2 className="jdm-job-title">{job.title}</h2>
                    <div className="jdm-badges-row">
                        <span className="jdm-badge jdm-badge-gold">
                            <TbBriefcase /> {job.type}
                        </span>
                        <span className="jdm-badge">
                            <TbMapPin /> {job.location}
                        </span>
                        <span className="jdm-badge jdm-badge-light">
                            <TbClock /> {job.experience}
                        </span>
                    </div>
                </div>

                {/* Modal Content */}
                <div className="jdm-body">
                    <div className="jdm-section">
                        <h4 className="jdm-sec-title">Role Overview</h4>
                        <p className="jdm-overview-text">{job.overview}</p>
                    </div>

                    <div className="jdm-section">
                        <h4 className="jdm-sec-title">Key Responsibilities</h4>
                        <ul className="jdm-list">
                            {job.responsibilities.map((resp, idx) => (
                                <li key={idx}>
                                    <span className="jdm-check-icon"><TbCheck /></span>
                                    <span>{resp}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="jdm-section">
                        <h4 className="jdm-sec-title">Requirements & Qualifications</h4>
                        <ul className="jdm-list">
                            {job.requirements.map((req, idx) => (
                                <li key={idx}>
                                    <span className="jdm-check-icon"><TbCheck /></span>
                                    <span>{req}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="jdm-section">
                        <h4 className="jdm-sec-title">What We Offer</h4>
                        <ul className="jdm-list">
                            {job.benefits.map((ben, idx) => (
                                <li key={idx}>
                                    <span className="jdm-check-icon gold-check"><TbCheck /></span>
                                    <span>{ben}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Modal Footer Actions */}
                <div className="jdm-footer">
                    <button className="jdm-btn-secondary" onClick={onClose}>
                        CLOSE
                    </button>
                    <button className="jdm-btn-primary" onClick={() => { onClose(); onApplyClick(job.title); }}>
                        APPLY FOR THIS POSITION <TbArrowRight />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default JobDetailModal;

const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const JobApplication = require('../models/JobApplication');
const JobOpening = require('../models/JobOpening');
const CareersHero = require('../models/CareersHero');

const EMAIL_USER = process.env.EMAIL_USER || 'unicstationary39a@gmail.com';
const EMAIL_PASS = process.env.EMAIL_PASS || 'afdhtikubzqyrlzs';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || EMAIL_USER;

const createTransporter = () => {
    return nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE || 'gmail',
        auth: {
            user: EMAIL_USER,
            pass: EMAIL_PASS
        }
    });
};

const initialMockJobs = [
    {
        title: 'Interior Designer',
        department: 'Design & Architecture',
        type: 'Full-time',
        location: 'Colombo, Sri Lanka',
        experience: '2 - 4 Years Experience',
        salaryRange: 'Negotiable (Based on Experience)',
        icon: 'design',
        order: 1,
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
    {
        title: 'Interior Architect',
        department: 'Architecture & Engineering',
        type: 'Full-time',
        location: 'Colombo, Sri Lanka',
        experience: '3 - 5 Years Experience',
        salaryRange: 'Negotiable (Based on Portfolio)',
        icon: 'architecture',
        order: 2,
        overview: 'Good Interior Design Studio is looking for an experienced Interior Architect to oversee technical drawings, structural interior modifications, ceiling & lighting plans, and detailed architectural joinery for high-end developments.',
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
    {
        title: '3D Visualizer',
        department: 'Visual Arts & Rendering',
        type: 'Full-time',
        location: 'Colombo, Sri Lanka',
        experience: '1 - 3 Years Experience',
        salaryRange: 'Competitive',
        icon: '3d',
        order: 3,
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
    {
        title: 'Marketing Executive',
        department: 'Brand & Communications',
        type: 'Full-time',
        location: 'Colombo, Sri Lanka',
        experience: '2 - 4 Years Experience',
        salaryRange: 'Competitive + Bonus',
        icon: 'marketing',
        order: 4,
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
    {
        title: 'Project Manager',
        department: 'Project Execution & Operations',
        type: 'Full-time',
        location: 'Colombo, Sri Lanka',
        experience: '4 - 7 Years Experience',
        salaryRange: 'Senior Salary Package',
        icon: 'project',
        order: 5,
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
    {
        title: 'Office Administrator',
        department: 'Administration & HR',
        type: 'Full-time',
        location: 'Colombo, Sri Lanka',
        experience: '1 - 3 Years Experience',
        salaryRange: 'Attractive Package',
        icon: 'office',
        order: 6,
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
];

// ── HERO SECTION ENDPOINTS ──

// GET /api/careers/hero
router.get('/hero', async (req, res) => {
    try {
        let hero = await CareersHero.findOne();
        if (!hero) {
            hero = new CareersHero({
                kicker: 'JOIN OUR TEAM',
                title: 'Build Your Career in Interior Design',
                description: "We're always looking for passionate, creative and talented individuals to join our team. If you love design and want to make a difference, we'd love to hear from you."
            });
            await hero.save();
        }
        res.status(200).json({ hero });
    } catch (error) {
        console.error('Fetch Careers Hero Error:', error);
        res.status(500).json({ message: 'Failed to fetch careers hero content' });
    }
});

// PUT /api/careers/hero (Admin)
router.put('/hero', async (req, res) => {
    try {
        let hero = await CareersHero.findOne();
        if (!hero) {
            hero = new CareersHero(req.body);
        } else {
            Object.assign(hero, req.body);
            hero.updatedAt = Date.now();
        }
        await hero.save();
        res.status(200).json({ message: 'Careers hero updated successfully', hero });
    } catch (error) {
        console.error('Update Careers Hero Error:', error);
        res.status(500).json({ message: 'Failed to update careers hero content' });
    }
});

// ── JOB OPENINGS ENDPOINTS ──

// GET /api/careers/jobs
router.get('/jobs', async (req, res) => {
    try {
        let jobs = await JobOpening.find().sort({ order: 1, createdAt: 1 });
        if (jobs.length === 0) {
            await JobOpening.insertMany(initialMockJobs);
            jobs = await JobOpening.find().sort({ order: 1, createdAt: 1 });
            console.log('✅ [CAREERS SEEDED] Default 6 mock job openings seeded into MongoDB!');
        }
        res.status(200).json({ count: jobs.length, jobs });
    } catch (error) {
        console.error('Get Job Openings Error:', error);
        res.status(500).json({ message: 'Failed to fetch job openings.' });
    }
});

// POST /api/careers/jobs (Admin)
router.post('/jobs', async (req, res) => {
    try {
        const { title, department, type, location, experience, salaryRange, overview, responsibilities, requirements, benefits, icon, order } = req.body;
        if (!title) {
            return res.status(400).json({ message: 'Job title is required' });
        }

        const count = await JobOpening.countDocuments();
        const newJob = new JobOpening({
            title: title.trim(),
            department: department ? department.trim() : 'Design Studio',
            type: type ? type.trim() : 'Full-time',
            location: location ? location.trim() : 'Colombo, Sri Lanka',
            experience: experience ? experience.trim() : '2 - 4 Years Experience',
            salaryRange: salaryRange ? salaryRange.trim() : 'Competitive',
            overview: overview ? overview.trim() : '',
            responsibilities: Array.isArray(responsibilities) ? responsibilities : (responsibilities ? responsibilities.split('\n').filter(Boolean) : []),
            requirements: Array.isArray(requirements) ? requirements : (requirements ? requirements.split('\n').filter(Boolean) : []),
            benefits: Array.isArray(benefits) ? benefits : (benefits ? benefits.split('\n').filter(Boolean) : []),
            icon: icon || 'design',
            order: order || count + 1
        });

        await newJob.save();
        res.status(201).json({ message: 'Job opening created successfully', job: newJob });
    } catch (error) {
        console.error('Create Job Opening Error:', error);
        res.status(500).json({ message: 'Failed to create job opening.' });
    }
});

// PUT /api/careers/jobs/:id (Admin)
router.put('/jobs/:id', async (req, res) => {
    try {
        const { title, department, type, location, experience, salaryRange, overview, responsibilities, requirements, benefits, icon, order, isActive } = req.body;

        const updateData = {};
        if (title !== undefined) updateData.title = title.trim();
        if (department !== undefined) updateData.department = department.trim();
        if (type !== undefined) updateData.type = type.trim();
        if (location !== undefined) updateData.location = location.trim();
        if (experience !== undefined) updateData.experience = experience.trim();
        if (salaryRange !== undefined) updateData.salaryRange = salaryRange.trim();
        if (overview !== undefined) updateData.overview = overview.trim();
        if (responsibilities !== undefined) updateData.responsibilities = Array.isArray(responsibilities) ? responsibilities : responsibilities.split('\n').filter(Boolean);
        if (requirements !== undefined) updateData.requirements = Array.isArray(requirements) ? requirements : requirements.split('\n').filter(Boolean);
        if (benefits !== undefined) updateData.benefits = Array.isArray(benefits) ? benefits : benefits.split('\n').filter(Boolean);
        if (icon !== undefined) updateData.icon = icon;
        if (order !== undefined) updateData.order = order;
        if (isActive !== undefined) updateData.isActive = isActive;

        const updatedJob = await JobOpening.findByIdAndUpdate(
            req.params.id,
            { $set: updateData },
            { new: true, runValidators: true }
        );

        if (!updatedJob) {
            return res.status(404).json({ message: 'Job opening not found.' });
        }

        res.status(200).json({ message: 'Job opening updated successfully', job: updatedJob });
    } catch (error) {
        console.error('Update Job Opening Error:', error);
        res.status(500).json({ message: 'Failed to update job opening.' });
    }
});

// DELETE /api/careers/jobs/:id (Admin)
router.delete('/jobs/:id', async (req, res) => {
    try {
        const deletedJob = await JobOpening.findByIdAndDelete(req.params.id);
        if (!deletedJob) {
            return res.status(404).json({ message: 'Job opening not found.' });
        }
        res.status(200).json({ message: 'Job opening deleted successfully.' });
    } catch (error) {
        console.error('Delete Job Opening Error:', error);
        res.status(500).json({ message: 'Failed to delete job opening.' });
    }
});

// ── CANDIDATE APPLICATIONS ENDPOINTS ──

// POST /api/careers/apply (Public)
router.post('/apply', async (req, res) => {
    try {
        const { fullName, email, phone, position, portfolioUrl, cvFile, cvFileName, userId, experience, message } = req.body;

        if (!fullName || !email || !phone || !position) {
            return res.status(400).json({ message: 'Full name, email, phone, and position are required.' });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
            return res.status(400).json({ message: 'Please enter a valid email address.' });
        }

        const newApplication = new JobApplication({
            fullName: fullName.trim(),
            email: email.trim().toLowerCase(),
            phone: phone.trim(),
            position: position.trim(),
            portfolioUrl: portfolioUrl ? portfolioUrl.trim() : '',
            cvFile: cvFile || '',
            cvFileName: cvFileName || '',
            userId: userId || '',
            experience: experience ? experience.trim() : '',
            message: message ? message.trim() : ''
        });

        await newApplication.save();
        console.log(`✅ [DB WRITE SUCCESS] New Job Application saved in MongoDB Atlas! ID: "${newApplication._id}", Candidate: "${newApplication.fullName}", Position: "${newApplication.position}"`);

        // Send Email Alert to Admin
        try {
            const transporter = createTransporter();
            const mailOptionsAdmin = {
                from: `"Good Interior Studio Careers" <${EMAIL_USER}>`,
                to: ADMIN_EMAIL,
                replyTo: `"${fullName.trim()}" <${email.trim()}>`,
                subject: `[NEW JOB APPLICATION] ${position.trim()} - ${fullName.trim()}`,
                html: `
                    <div style="font-family: 'Segoe UI', Arial, sans-serif; background-color: #f8fafc; padding: 30px; color: #1e293b;">
                        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; padding: 30px; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
                            <div style="text-align: center; padding-bottom: 20px; border-bottom: 2px solid #b38058;">
                                <h2 style="color: #b38058; margin: 0; font-size: 22px; letter-spacing: 1px;">GOOD INTERIOR DESIGN STUDIO</h2>
                                <p style="font-size: 12px; color: #64748b; margin: 5px 0 0 0; letter-spacing: 2px;">NEW CAREER JOB APPLICATION</p>
                            </div>
                            
                            <div style="padding: 24px 0;">
                                <p style="font-size: 15px; color: #0f172a; margin-bottom: 15px;">A new candidate has applied for a position on the Careers page:</p>
                                <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                                    <tr><td style="padding: 8px 0; color: #64748b; width: 140px;"><strong>Candidate Name:</strong></td><td style="color: #0f172a; font-weight: 600;">${fullName.trim()}</td></tr>
                                    <tr><td style="padding: 8px 0; color: #64748b;"><strong>Position Applied:</strong></td><td style="color: #b38058; font-weight: 700;">${position.trim()}</td></tr>
                                    <tr><td style="padding: 8px 0; color: #64748b;"><strong>Email:</strong></td><td style="color: #0f172a;"><a href="mailto:${email.trim()}">${email.trim()}</a></td></tr>
                                    <tr><td style="padding: 8px 0; color: #64748b;"><strong>Phone:</strong></td><td style="color: #0f172a;">${phone.trim()}</td></tr>
                                    ${experience ? `<tr><td style="padding: 8px 0; color: #64748b;"><strong>Experience:</strong></td><td style="color: #0f172a;">${experience.trim()}</td></tr>` : ''}
                                    ${cvFileName ? `<tr><td style="padding: 8px 0; color: #64748b;"><strong>Uploaded CV:</strong></td><td style="color: #2563eb; font-weight: 600;">📄 ${cvFileName} (Available in Admin Dashboard)</td></tr>` : ''}
                                    ${portfolioUrl ? `<tr><td style="padding: 8px 0; color: #64748b;"><strong>Portfolio / Drive Link:</strong></td><td style="color: #0f172a;"><a href="${portfolioUrl.trim()}" target="_blank">${portfolioUrl.trim()}</a></td></tr>` : ''}
                                </table>

                                ${message ? `
                                <div style="background-color: #f1f5f9; border-left: 4px solid #b38058; padding: 15px; border-radius: 4px; margin: 20px 0;">
                                    <p style="font-size: 12px; font-weight: 600; color: #475569; margin: 0 0 5px 0;">Candidate Cover Note / Intro:</p>
                                    <p style="font-size: 14px; color: #1e293b; margin: 0; white-space: pre-line;">${message.trim()}</p>
                                </div>
                                ` : ''}

                                <p style="font-size: 13px; color: #64748b; font-style: italic; margin-top: 20px;">
                                    💡 <strong>Tip:</strong> You can view full details & candidate CV directly in the <strong>Admin Dashboard -> Careers Manage -> Applications</strong> tab!
                                </p>
                            </div>

                            <div style="border-top: 1px solid #e2e8f0; padding-top: 15px; text-align: center; font-size: 12px; color: #94a3b8;">
                                <p style="margin: 0;">Good Interior Studio Automated Recruitment System</p>
                            </div>
                        </div>
                    </div>
                `
            };
            await transporter.sendMail(mailOptionsAdmin);
            console.log(`✅ [ADMIN NOTIFIED] Instant email alert sent to admin (${ADMIN_EMAIL}) for job application.`);

            // Send Auto-Acknowledgement Email to the Applicant
            const mailOptionsApplicant = {
                from: `"Good Interior Studio Careers" <${EMAIL_USER}>`,
                to: email.trim(),
                subject: `Application Received - ${position.trim()} | Good Interior Studio`,
                html: `
                    <div style="font-family: 'Segoe UI', Arial, sans-serif; background-color: #f8fafc; padding: 30px; color: #1e293b;">
                        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; padding: 30px; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
                            <div style="text-align: center; padding-bottom: 20px; border-bottom: 2px solid #b38058;">
                                <h2 style="color: #b38058; margin: 0; font-size: 22px; letter-spacing: 1px;">GOOD INTERIOR DESIGN STUDIO</h2>
                                <p style="font-size: 12px; color: #64748b; margin: 5px 0 0 0; letter-spacing: 2px;">APPLICATION ACKNOWLEDGEMENT</p>
                            </div>
                            
                            <div style="padding: 24px 0;">
                                <h3 style="color: #0f172a; margin-top: 0;">Dear ${fullName.trim()},</h3>
                                <p style="font-size: 14px; color: #334155; line-height: 1.6;">
                                    Thank you for applying for the <strong>${position.trim()}</strong> position at Good Interior Studio. We have successfully received your job application and details.
                                </p>
                                <p style="font-size: 14px; color: #334155; line-height: 1.6;">
                                    Our HR and Lead Architecture team will review your CV and portfolio. If your qualifications match our requirements, we will reach out to you directly for an interview.
                                </p>
                                
                                <div style="background-color: #faf2ea; border-left: 4px solid #b38058; padding: 15px; margin: 20px 0; border-radius: 6px;">
                                    <p style="font-size: 13px; color: #78350f; margin: 0; line-height: 1.6;">
                                        📌 <strong>Application Summary:</strong><br/>
                                        • <strong>Position:</strong> ${position.trim()}<br/>
                                        • <strong>Email:</strong> ${email.trim()}<br/>
                                        • <strong>Phone:</strong> ${phone.trim()}<br/>
                                        ${cvFileName ? `• <strong>Attached CV:</strong> ${cvFileName}` : ''}
                                    </p>
                                </div>

                                <p style="font-size: 14px; color: #334155; line-height: 1.6;">
                                    We appreciate your interest in building a career with Good Interior Studio.
                                </p>
                                
                                <p style="font-size: 14px; color: #0f172a; margin-top: 25px;">
                                    Best regards,<br/>
                                    <strong>Recruitment & Talent Team</strong><br/>
                                    <span style="color: #b38058; font-weight: 600;">Good Interior Studio, Colombo</span>
                                </p>
                            </div>

                            <div style="border-top: 1px solid #e2e8f0; padding-top: 15px; text-align: center; font-size: 12px; color: #94a3b8;">
                                <p style="margin: 0;">Good Interior Studio • Colombo, Sri Lanka</p>
                            </div>
                        </div>
                    </div>
                `
            };
            await transporter.sendMail(mailOptionsApplicant);
            console.log(`✅ [APPLICANT NOTIFIED] Auto-acknowledgement email sent to candidate (${email.trim()}).`);
        } catch (notifyErr) {
            console.warn(`⚠️ [NOTIFY WARNING] Could not send email notifications:`, notifyErr.message);
        }

        res.status(201).json({
            message: 'Application submitted successfully! Our recruitment team will review your details and contact you soon.',
            application: newApplication
        });
    } catch (error) {
        console.error('Job Application Error:', error);
        res.status(500).json({ message: 'Server error while submitting application. Please try again.' });
    }
});

// GET /api/careers/applications (Admin)
router.get('/applications', async (req, res) => {
    try {
        const applications = await JobApplication.find().sort({ createdAt: -1 });
        res.status(200).json({ count: applications.length, applications });
    } catch (error) {
        console.error('Get Job Applications Error:', error);
        res.status(500).json({ message: 'Failed to fetch job applications.' });
    }
});

// PUT /api/careers/applications/:id/status (Admin)
router.put('/applications/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        const updatedApp = await JobApplication.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );
        if (!updatedApp) {
            return res.status(404).json({ message: 'Job application not found.' });
        }
        res.status(200).json({ message: 'Status updated successfully', application: updatedApp });
    } catch (error) {
        console.error('Update Application Status Error:', error);
        res.status(500).json({ message: 'Failed to update application status.' });
    }
});

// POST /api/careers/send-candidate-email (Admin)
router.post('/send-candidate-email', async (req, res) => {
    try {
        const { applicationId, recipientEmail, recipientName, position, subject, bodyMessage, statusTag } = req.body;

        if (!recipientEmail || !subject || !bodyMessage) {
            return res.status(400).json({ message: 'Recipient email, subject, and body message are required.' });
        }

        const transporter = createTransporter();
        const mailOptions = {
            from: `"Good Interior Studio Careers" <${EMAIL_USER}>`,
            to: recipientEmail.trim(),
            subject: subject.trim(),
            html: `
                <div style="font-family: 'Segoe UI', Arial, sans-serif; background-color: #f8fafc; padding: 30px; color: #1e293b;">
                    <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; padding: 30px; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
                        <div style="text-align: center; padding-bottom: 20px; border-bottom: 2px solid #b38058;">
                            <h2 style="color: #b38058; margin: 0; font-size: 22px; letter-spacing: 1px;">GOOD INTERIOR DESIGN STUDIO</h2>
                            <p style="font-size: 12px; color: #64748b; margin: 5px 0 0 0; letter-spacing: 2px;">CAREERS & RECRUITMENT TEAM</p>
                        </div>
                        
                        <div style="padding: 24px 0;">
                            <h3 style="color: #0f172a; margin-top: 0;">Dear ${recipientName ? recipientName.trim() : 'Applicant'},</h3>
                            <div style="font-size: 14px; color: #334155; line-height: 1.6; white-space: pre-line;">${bodyMessage.trim()}</div>
                            
                            <p style="font-size: 14px; color: #0f172a; margin-top: 25px;">
                                Warm regards,<br/>
                                <strong>HR & Talent Acquisition</strong><br/>
                                <span style="color: #b38058; font-weight: 600;">Good Interior Studio, Colombo</span>
                            </p>
                        </div>

                        <div style="border-top: 1px solid #e2e8f0; padding-top: 15px; text-align: center; font-size: 12px; color: #94a3b8;">
                            <p style="margin: 0;">Good Interior Studio • Colombo, Sri Lanka</p>
                        </div>
                    </div>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);

        // Optionally update status in database if provided
        if (applicationId && statusTag) {
            await JobApplication.findByIdAndUpdate(applicationId, { status: statusTag });
        }

        console.log(`✅ [ADMIN EMAIL SENT] Candidate email sent to ${recipientEmail.trim()}`);
        res.status(200).json({ message: `Email successfully sent to ${recipientEmail.trim()}` });
    } catch (error) {
        console.error('Send Candidate Email Error:', error);
        res.status(500).json({ message: 'Failed to send email to candidate.' });
    }
});

// DELETE /api/careers/applications/:id (Admin)
router.delete('/applications/:id', async (req, res) => {
    try {
        const deletedApplication = await JobApplication.findByIdAndDelete(req.params.id);
        if (!deletedApplication) {
            return res.status(404).json({ message: 'Job application not found.' });
        }
        res.status(200).json({ message: 'Job application deleted successfully.' });
    } catch (error) {
        console.error('Delete Application Error:', error);
        res.status(500).json({ message: 'Failed to delete application.' });
    }
});

module.exports = router;

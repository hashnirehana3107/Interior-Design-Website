import re

path = 'd:/Digiline Cloud/Interior Design Website/frontend/src/pages/AdminDashboard.jsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. State
state_old = "const [heroSlides, setHeroSlides] = useState([]);"
state_new = """const [heroSlides, setHeroSlides] = useState([]);
    const [homeSubTab, setHomeSubTab] = useState('slides');
    const [homeSettings, setHomeSettings] = useState({
        about: { kicker: 'WHO WE ARE', title: 'We are a passionate<br />interior design studio.', desc1: 'At Good Interior, we believe that great design improves the way people live and work.', desc2: 'We blend creativity, functionality and detail to deliver spaces that are beautiful, comfortable and uniquely yours.', buttonText: 'ABOUT OUR STUDIO', buttonLink: '/about', image: '' },
        whyChoose: { kicker: 'WHY CHOOSE US', title: 'Because we care<br />about the details.', features: [
            { iconName: 'FaUserCheck', title: 'Personalized Approach', description: 'We listen, understand and design spaces that reflect your lifestyle.' },
            { iconName: 'FaRegBuilding', title: 'Experienced Team', description: 'Our creative team brings years of expertise and passion to every project.' },
            { iconName: 'FaGem', title: 'Quality & Trust', description: 'We use premium materials and ensure quality in every detail.' },
            { iconName: 'FaRegClock', title: 'On-time Delivery', description: 'We value your time and deliver projects as promised.' }
        ]}
    });"""
if "const [homeSubTab" not in content:
    content = content.replace(state_old, state_new)

# 2. handleSaveHomeSettings
save_fn = """const fetchHomeSettings = async () => {
        try {
            const res = await fetch(`${API_BASE}/api/home-settings`);
            const data = await res.json();
            if (res.ok && data.settings) {
                const mergeFeatures = data.settings.whyChoose?.features?.length > 0 
                  ? data.settings.whyChoose.features 
                  : [
                      { iconName: 'FaUserCheck', title: '', description: '' },
                      { iconName: 'FaRegBuilding', title: '', description: '' },
                      { iconName: 'FaGem', title: '', description: '' },
                      { iconName: 'FaRegClock', title: '', description: '' }
                    ];
                setHomeSettings({
                    ...data.settings,
                    whyChoose: {
                        ...(data.settings.whyChoose || {}),
                        features: mergeFeatures
                    }
                });
            }
        } catch (err) {
            console.error('Error fetching home settings:', err);
        }
    };

    const handleSaveHomeSettings = async () => {
        try {
            const res = await fetch(`${API_BASE}/api/home-settings`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(homeSettings)
            });
            if (res.ok) {
                if (showToast) showToast('Home Page settings updated successfully!', 'success');
                fetchHomeSettings();
            } else {
                if (showToast) showToast('Failed to update settings.', 'error');
            }
        } catch (err) {
            if (showToast) showToast('Network error.', 'error');
        }
    };

    const fetchHeroSlides"""

if "fetchHomeSettings = async" not in content:
    content = content.replace("const fetchHeroSlides", save_fn)
    content = content.replace("fetchHeroSlides(),", "fetchHeroSlides(),\\n                fetchHomeSettings(),")


# Sidebar text
content = content.replace(
    '<TbSlideshow className="tab-icon" /> Home Hero Slides ({heroSlides.length})',
    '<TbSlideshow className="tab-icon" /> Home Page Manage'
)

# Header
hdr_old = """                            <div className="panel-header">
                                <div>
                                    <h2>Homepage Hero Slideshow Manager</h2>
                                    <p>Add, edit, or toggle slides displayed in the Home page hero section. Text overlays are optional.</p>
                                </div>
                                <button
                                    className="btn-primary-gold"
                                    onClick={() => {
                                        setEditingSlide(null);
                                        setSlideForm({ image: '', kicker: '', title: '', subtitle: '', order: heroSlides.length + 1, active: true });
                                        setSlideModalOpen(true);
                                    }}
                                >
                                    <TbPlus /> ADD HERO SLIDE
                                </button>
                            </div>

                            {heroSlides.length === 0 ? ("""

hdr_new = """                            <div className="panel-header">
                                <div>
                                    <h2>Homepage Management</h2>
                                    <p>Manage the slides, about section, and why choose us section on the home page.</p>
                                </div>
                                {homeSubTab === 'slides' && (
                                    <button
                                        className="btn-primary-gold"
                                        onClick={() => {
                                            setEditingSlide(null);
                                            setSlideForm({ image: '', kicker: '', title: '', subtitle: '', order: heroSlides.length + 1, active: true });
                                            setSlideModalOpen(true);
                                        }}
                                    >
                                        <TbPlus /> ADD HERO SLIDE
                                    </button>
                                )}
                                {homeSubTab !== 'slides' && (
                                    <button
                                        className="btn-primary-gold"
                                        onClick={handleSaveHomeSettings}
                                    >
                                        <TbCheck /> SAVE CHANGES
                                    </button>
                                )}
                            </div>

                            {/* Home Sub-tabs */}
                            <div style={{ display: 'flex', gap: '12px', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: '20px', paddingBottom: '10px', flexWrap: 'wrap' }}>
                                <button
                                    onClick={() => setHomeSubTab('slides')}
                                    style={{
                                        background: homeSubTab === 'slides' ? '#c48b59' : 'transparent',
                                        color: homeSubTab === 'slides' ? '#fff' : '#94a3b8',
                                        border: homeSubTab === 'slides' ? 'none' : '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '6px',
                                        padding: '8px 18px',
                                        fontSize: '0.85rem',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                    }}
                                >
                                    Hero Slides ({heroSlides.length})
                                </button>
                                <button
                                    onClick={() => setHomeSubTab('about')}
                                    style={{
                                        background: homeSubTab === 'about' ? '#c48b59' : 'transparent',
                                        color: homeSubTab === 'about' ? '#fff' : '#94a3b8',
                                        border: homeSubTab === 'about' ? 'none' : '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '6px',
                                        padding: '8px 18px',
                                        fontSize: '0.85rem',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                    }}
                                >
                                    Who We Are
                                </button>
                                <button
                                    onClick={() => setHomeSubTab('why')}
                                    style={{
                                        background: homeSubTab === 'why' ? '#c48b59' : 'transparent',
                                        color: homeSubTab === 'why' ? '#fff' : '#94a3b8',
                                        border: homeSubTab === 'why' ? 'none' : '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '6px',
                                        padding: '8px 18px',
                                        fontSize: '0.85rem',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                    }}
                                >
                                    Why Choose Us
                                </button>
                            </div>

                            {/* SUB-TAB 1: WHO WE ARE */}
                            {homeSubTab === 'about' && (
                                <div className="admin-form-card" style={{ maxWidth: '800px' }}>
                                    <h3>Configure "Who We Are" Section</h3>
                                    <div className="form-group">
                                        <label>Kicker Text</label>
                                        <input type="text" value={homeSettings?.about?.kicker || ''} onChange={e => setHomeSettings({...homeSettings, about: {...homeSettings.about, kicker: e.target.value}})} placeholder="e.g. WHO WE ARE" />
                                    </div>
                                    <div className="form-group">
                                        <label>Main Title (HTML allowed for breaks)</label>
                                        <textarea value={homeSettings?.about?.title || ''} onChange={e => setHomeSettings({...homeSettings, about: {...homeSettings.about, title: e.target.value}})} rows={3}></textarea>
                                    </div>
                                    <div className="form-group">
                                        <label>Description Paragraph 1</label>
                                        <textarea value={homeSettings?.about?.desc1 || ''} onChange={e => setHomeSettings({...homeSettings, about: {...homeSettings.about, desc1: e.target.value}})} rows={3}></textarea>
                                    </div>
                                    <div className="form-group">
                                        <label>Description Paragraph 2</label>
                                        <textarea value={homeSettings?.about?.desc2 || ''} onChange={e => setHomeSettings({...homeSettings, about: {...homeSettings.about, desc2: e.target.value}})} rows={3}></textarea>
                                    </div>
                                    <div className="form-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px'}}>
                                        <div>
                                            <label>Button Text</label>
                                            <input type="text" value={homeSettings?.about?.buttonText || ''} onChange={e => setHomeSettings({...homeSettings, about: {...homeSettings.about, buttonText: e.target.value}})} />
                                        </div>
                                        <div>
                                            <label>Button Link</label>
                                            <input type="text" value={homeSettings?.about?.buttonLink || ''} onChange={e => setHomeSettings({...homeSettings, about: {...homeSettings.about, buttonLink: e.target.value}})} />
                                        </div>
                                    </div>
                                    
                                    <div className="form-group img-upload-group">
                                        <label>Side Feature Image (Choose file or provide URL)</label>
                                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                            <input
                                                type="text"
                                                placeholder="Provide Image URL (https://...)"
                                                value={homeSettings?.about?.image || ''}
                                                onChange={e => setHomeSettings({...homeSettings, about: {...homeSettings.about, image: e.target.value}})}
                                                style={{ flex: 1, padding: '12px 14px', borderRadius: '6px', border: '1px solid #334155', background: '#0f172a', color: '#fff', fontSize: '0.85rem' }}
                                            />
                                            <span>OR</span>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                id="upload-home-about-img"
                                                style={{ display: 'none' }}
                                                onChange={async (e) => {
                                                    const file = e.target.files[0];
                                                    if (file) {
                                                        const b64 = await compressImage(file);
                                                        setHomeSettings({...homeSettings, about: {...homeSettings.about, image: b64}});
                                                    }
                                                }}
                                            />
                                            <label htmlFor="upload-home-about-img" className="btn-secondary" style={{ padding: '11px 16px', background: '#334155', color: '#fff', cursor: 'pointer', borderRadius: '6px', fontSize: '0.85rem' }}>Choose File</label>
                                        </div>
                                        {homeSettings?.about?.image && <div style={{ marginTop: '10px' }}><img src={homeSettings.about.image} alt="Preview" style={{ height: '80px', borderRadius: '6px' }} /></div>}
                                    </div>
                                </div>
                            )}

                            {/* SUB-TAB 2: WHY CHOOSE US */}
                            {homeSubTab === 'why' && (
                                <div className="admin-form-card" style={{ maxWidth: '800px' }}>
                                    <h3>Configure "Why Choose Us" Section</h3>
                                    <div className="form-group" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '15px' }}>
                                        <div>
                                            <label>Kicker Text</label>
                                            <input type="text" value={homeSettings?.whyChoose?.kicker || ''} onChange={e => setHomeSettings({...homeSettings, whyChoose: {...homeSettings.whyChoose, kicker: e.target.value}})} placeholder="e.g. WHY CHOOSE US" />
                                        </div>
                                        <div>
                                            <label>Main Title (HTML allowed)</label>
                                            <input type="text" value={homeSettings?.whyChoose?.title || ''} onChange={e => setHomeSettings({...homeSettings, whyChoose: {...homeSettings.whyChoose, title: e.target.value}})} />
                                        </div>
                                    </div>
                                    <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.1)', margin: '20px 0' }} />
                                    <h4>Features Settings</h4>
                                    {[0, 1, 2, 3].map((idx) => {
                                        const feat = homeSettings?.whyChoose?.features?.[idx] || { iconName: 'FaUserCheck', title: '', description: '' };
                                        return (
                                            <div key={idx} style={{ padding: '15px', background: '#0f172a', borderRadius: '8px', marginBottom: '15px', border: '1px solid #1e293b' }}>
                                                <div style={{ display: 'flex', gap: '15px' }}>
                                                    <div style={{ flex: '1' }}>
                                                        <label style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Icon (FaUserCheck, FaRegBuilding, FaGem, FaRegClock)</label>
                                                        <input 
                                                            type="text" 
                                                            value={feat.iconName || ''} 
                                                            onChange={e => {
                                                                const newFs = [...(homeSettings?.whyChoose?.features||[])];
                                                                newFs[idx] = {...newFs[idx], iconName: e.target.value};
                                                                setHomeSettings({...homeSettings, whyChoose: {...homeSettings.whyChoose, features: newFs}});
                                                            }} 
                                                        />
                                                    </div>
                                                    <div style={{ flex: '2' }}>
                                                        <label style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Title</label>
                                                        <input 
                                                            type="text" 
                                                            value={feat.title || ''} 
                                                            onChange={e => {
                                                                const newFs = [...(homeSettings?.whyChoose?.features||[])];
                                                                newFs[idx] = {...newFs[idx], title: e.target.value};
                                                                setHomeSettings({...homeSettings, whyChoose: {...homeSettings.whyChoose, features: newFs}});
                                                            }} 
                                                        />
                                                    </div>
                                                </div>
                                                <div style={{ marginTop: '10px' }}>
                                                    <label style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Description</label>
                                                    <textarea 
                                                        rows="2" 
                                                        value={feat.description || ''} 
                                                        onChange={e => {
                                                            const newFs = [...(homeSettings?.whyChoose?.features||[])];
                                                            newFs[idx] = {...newFs[idx], description: e.target.value};
                                                            setHomeSettings({...homeSettings, whyChoose: {...homeSettings.whyChoose, features: newFs}});
                                                        }} 
                                                    ></textarea>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}

                            {/* SUB-TAB 0: SLIDES */}
                            {homeSubTab === 'slides' && (
                                <>
                                {heroSlides.length === 0 ? ("""

content = content.replace(hdr_old, hdr_new)

# footer 
ftr_old = """                                    ))}
                                </div>
                            )}
                        </div>
                    )}"""
ftr_new = """                                    ))}
                                </div>
                            )}
                                </>
                            )}
                        </div>
                    )}"""

# We only want to replace the FIRST occurrence after the hero slides, so we do this:
# Wait, let's just make the replacement exactly for the end of the `hero` activeTab block.
content = content.replace(ftr_old, ftr_new, 1)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print('AdminDashboard successfully modified!')

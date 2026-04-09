feather.replace({ 'stroke-width': 1.2 });

        const FORUM_PROFILE_KEY = 'forumProfile';
        const API_CHAT_SETTINGS_KEY = 'apiChatSettings';
        const API_VOICE_SETTINGS_KEY = 'apiVoiceSettings';
        const SECURITY_SETTINGS_KEY = 'securitySettings';
        const CHAT_ROLE_THREADS_KEY = 'chatRoleThreads';
        const API_CHAT_DRAFT_STORAGE_KEY = 'yuApiChatDraft';
        const API_VOICE_DRAFT_STORAGE_KEY = 'yuApiVoiceDraft';
        const API_SETTINGS_DRAFT_DEBOUNCE_MS = 280;
        const LOCK_PASSWORD_LENGTH = 4;
        const DATA_EXPORT_VERSION = 1;
        const DATA_GROUP_DEFINITIONS = [
            { key: 'music', label: '音乐', type: 'table' },
            { key: 'worldbook', label: '世界书', type: 'table' },
            { key: 'archiveProfiles', label: '档案', type: 'table' },
            { key: 'forumProfile', label: '论坛资料', type: 'setting', settingKey: FORUM_PROFILE_KEY },
            { key: 'apiChatSettings', label: 'API 聊天', type: 'setting', settingKey: API_CHAT_SETTINGS_KEY },
            { key: 'apiVoiceSettings', label: 'API 语音', type: 'setting', settingKey: API_VOICE_SETTINGS_KEY },
            { key: 'securitySettings', label: '安全设置', type: 'setting', settingKey: SECURITY_SETTINGS_KEY }
        ];
        const LEGAL_MODAL_CONTENT = {
            disclaimer: {
                title: '免责协议',
                intro: '本应用为本地创作与整理工具，不主动替用户取得任何第三方授权，也不代替用户判断具体内容在其所在地区是否合规。',
                sections: [
                    {
                        title: '成人内容提示',
                        items: [
                            '后续若出现成人向、露骨、性暗示或其他敏感内容功能，用户应确认自己已达到所在地区法定年龄并具备合法使用资格。',
                            '未成年人、限制人群或不适用地区的用户，不得使用相关功能、存储相关内容或向他人传播相关结果。'
                        ]
                    },
                    {
                        title: '用户责任',
                        items: [
                            '用户对自行输入、上传、导入、保存、导出、分享和传播的全部内容独立负责。',
                            '不得利用本应用制作、传播违法违规内容，不得用于骚扰、剥削、侮辱、诽谤、侵犯隐私或其他侵害他人权益的用途。'
                        ]
                    },
                    {
                        title: '责任边界',
                        items: [
                            '开发者仅提供本地工具能力，对用户自行生成、存储、转发或发布的内容及由此产生的争议、损失、处罚或索赔不承担责任。',
                            '如因用户行为引发法律风险、平台处罚、版权投诉或第三方纠纷，责任由实际使用者自行承担。'
                        ]
                    }
                ],
                note: '继续使用本应用，即视为你已理解并接受以上免责边界与合规要求。'
            },
            copyright: {
                title: '版权保护',
                intro: '用户应确保导入、引用、训练、改写、保存和传播的素材具有合法来源，并尊重原作者、表演者、摄影者及相关权利人的权益。',
                sections: [
                    {
                        title: '禁止侵权内容',
                        items: [
                            '未经授权，不得上传、导入、分发受著作权保护的小说、剧本、图片、音乐、语音、立绘、商标素材或付费资源。',
                            '不得移除、遮盖或伪造版权声明、水印、署名信息和来源标识。'
                        ]
                    },
                    {
                        title: '生成内容与衍生内容',
                        items: [
                            '如生成结果明显包含他人受保护角色、画面、文本片段或可识别风格，用户应自行判断是否需要额外授权后再公开使用。',
                            '用户对导出文件、存档、备份以及再次分发的行为承担完整版权审查义务。'
                        ]
                    },
                    {
                        title: '投诉与处置',
                        items: [
                            '当作品权利人提出投诉、删除或停止传播要求时，用户应立即停止使用相关素材并自行处理后续责任。',
                            '开发者保留在必要时补充版权提示、限制高风险功能或调整文案的权利。'
                        ]
                    }
                ],
                note: '如你无法确认素材来源或授权状态，最稳妥的处理方式是不要导入、不要保存、不要传播。'
            }
        };
        // Dexie 数据库封装：统一所有 IndexedDB 读写入口
        class YuAppDatabase {
            constructor() {
                this.db = new Dexie('YuMusicDatabase');
                this.db.version(2).stores({
                    music: 'id, title, singer, url, cover'
                });
                this.db.version(3).stores({
                    music: 'id, title, singer, url, cover',
                    worldbook: 'id, title, scope, triggerMode, injectPosition, updatedAt'
                });
                this.db.version(4).stores({
                    music: 'id, title, singer, url, cover',
                    worldbook: 'id, title, scope, triggerMode, injectPosition, updatedAt',
                    archiveProfiles: 'id, type, name, updatedAt'
                });
                this.db.version(5).stores({
                    music: 'id, title, singer, url, cover',
                    worldbook: 'id, title, scope, triggerMode, injectPosition, updatedAt',
                    archiveProfiles: 'id, type, name, updatedAt',
                    appSettings: 'key, updatedAt'
                });
            }

            async getForumProfile() {
                return this.db.appSettings.get(FORUM_PROFILE_KEY);
            }

            async saveForumProfile(profile) {
                return this.db.appSettings.put({
                    key: FORUM_PROFILE_KEY,
                    ...profile
                });
            }

            async getApiChatSettings() {
                return this.db.appSettings.get(API_CHAT_SETTINGS_KEY);
            }

            async saveApiChatSettings(settings) {
                return this.db.appSettings.put({
                    key: API_CHAT_SETTINGS_KEY,
                    ...settings
                });
            }

            async deleteApiChatSettings() {
                return this.db.appSettings.delete(API_CHAT_SETTINGS_KEY);
            }

            async getApiVoiceSettings() {
                return this.db.appSettings.get(API_VOICE_SETTINGS_KEY);
            }

            async saveApiVoiceSettings(settings) {
                return this.db.appSettings.put({
                    key: API_VOICE_SETTINGS_KEY,
                    ...settings
                });
            }

            async deleteApiVoiceSettings() {
                return this.db.appSettings.delete(API_VOICE_SETTINGS_KEY);
            }

            async getSecuritySettings() {
                return this.db.appSettings.get(SECURITY_SETTINGS_KEY);
            }

            async saveSecuritySettings(settings) {
                return this.db.appSettings.put({
                    key: SECURITY_SETTINGS_KEY,
                    ...settings
                });
            }

            async deleteSecuritySettings() {
                return this.db.appSettings.delete(SECURITY_SETTINGS_KEY);
            }

            async getChatRoleThreads() {
                return this.db.appSettings.get(CHAT_ROLE_THREADS_KEY);
            }

            async saveChatRoleThreads(settings) {
                return this.db.appSettings.put({
                    key: CHAT_ROLE_THREADS_KEY,
                    ...settings
                });
            }

            async deleteChatRoleThreads() {
                return this.db.appSettings.delete(CHAT_ROLE_THREADS_KEY);
            }

            async listWorldbooks() {
                return this.db.worldbook.toArray();
            }

            async upsertWorldbook(entry) {
                return this.db.worldbook.put(entry);
            }

            async deleteWorldbook(id) {
                return this.db.worldbook.delete(id);
            }

            async listArchiveProfiles() {
                return this.db.archiveProfiles.toArray();
            }

            async upsertArchiveProfile(entry) {
                return this.db.archiveProfiles.put(entry);
            }

            async deleteArchiveProfile(id) {
                return this.db.archiveProfiles.delete(id);
            }

            async listMusic() {
                return this.db.music.toArray();
            }

            async upsertMusic(entry) {
                return this.db.music.put(entry);
            }

            async deleteMusic(id) {
                return this.db.music.delete(id);
            }

            async getManagedDataPayload(groupKeys = DATA_GROUP_DEFINITIONS.map(item => item.key)) {
                return this.db.transaction('r', this.db.music, this.db.worldbook, this.db.archiveProfiles, this.db.appSettings, async () => {
                    const payload = {};

                    for (const groupKey of groupKeys) {
                        switch (groupKey) {
                            case 'music':
                                payload.music = await this.db.music.toArray();
                                break;
                            case 'worldbook':
                                payload.worldbook = await this.db.worldbook.toArray();
                                break;
                            case 'archiveProfiles':
                                payload.archiveProfiles = await this.db.archiveProfiles.toArray();
                                payload.chatRoleThreads = await this.db.appSettings.get(CHAT_ROLE_THREADS_KEY);
                                break;
                            case 'forumProfile':
                                payload.forumProfile = await this.db.appSettings.get(FORUM_PROFILE_KEY);
                                break;
                            case 'apiChatSettings':
                                payload.apiChatSettings = await this.db.appSettings.get(API_CHAT_SETTINGS_KEY);
                                break;
                            case 'apiVoiceSettings':
                                payload.apiVoiceSettings = await this.db.appSettings.get(API_VOICE_SETTINGS_KEY);
                                break;
                            case 'securitySettings':
                                payload.securitySettings = await this.db.appSettings.get(SECURITY_SETTINGS_KEY);
                                break;
                            default:
                                break;
                        }
                    }

                    return payload;
                });
            }

            async replaceManagedData(payload = {}, groupKeys = Object.keys(payload)) {
                return this.db.transaction('rw', this.db.music, this.db.worldbook, this.db.archiveProfiles, this.db.appSettings, async () => {
                    for (const groupKey of groupKeys) {
                        switch (groupKey) {
                            case 'music':
                                await this.db.music.clear();
                                if (Array.isArray(payload.music) && payload.music.length) await this.db.music.bulkPut(payload.music);
                                break;
                            case 'worldbook':
                                await this.db.worldbook.clear();
                                if (Array.isArray(payload.worldbook) && payload.worldbook.length) await this.db.worldbook.bulkPut(payload.worldbook);
                                break;
                            case 'archiveProfiles':
                                await this.db.archiveProfiles.clear();
                                if (Array.isArray(payload.archiveProfiles) && payload.archiveProfiles.length) await this.db.archiveProfiles.bulkPut(payload.archiveProfiles);
                                if (Object.prototype.hasOwnProperty.call(payload, 'chatRoleThreads')) {
                                    if (payload.chatRoleThreads) await this.db.appSettings.put({ ...payload.chatRoleThreads, key: CHAT_ROLE_THREADS_KEY });
                                    else await this.db.appSettings.delete(CHAT_ROLE_THREADS_KEY);
                                }
                                break;
                            case 'forumProfile':
                                if (payload.forumProfile) await this.db.appSettings.put({ ...payload.forumProfile, key: FORUM_PROFILE_KEY });
                                else await this.db.appSettings.delete(FORUM_PROFILE_KEY);
                                break;
                            case 'apiChatSettings':
                                if (payload.apiChatSettings) await this.db.appSettings.put({ ...payload.apiChatSettings, key: API_CHAT_SETTINGS_KEY });
                                else await this.db.appSettings.delete(API_CHAT_SETTINGS_KEY);
                                break;
                            case 'apiVoiceSettings':
                                if (payload.apiVoiceSettings) await this.db.appSettings.put({ ...payload.apiVoiceSettings, key: API_VOICE_SETTINGS_KEY });
                                else await this.db.appSettings.delete(API_VOICE_SETTINGS_KEY);
                                break;
                            case 'securitySettings':
                                if (payload.securitySettings) await this.db.appSettings.put({ ...payload.securitySettings, key: SECURITY_SETTINGS_KEY });
                                else await this.db.appSettings.delete(SECURITY_SETTINGS_KEY);
                                break;
                            default:
                                break;
                        }
                    }
                });
            }

            async clearManagedData(groupKeys = DATA_GROUP_DEFINITIONS.map(item => item.key)) {
                return this.db.transaction('rw', this.db.music, this.db.worldbook, this.db.archiveProfiles, this.db.appSettings, async () => {
                    for (const groupKey of groupKeys) {
                        switch (groupKey) {
                            case 'music':
                                await this.db.music.clear();
                                break;
                            case 'worldbook':
                                await this.db.worldbook.clear();
                                break;
                            case 'archiveProfiles':
                                await this.db.archiveProfiles.clear();
                                await this.db.appSettings.delete(CHAT_ROLE_THREADS_KEY);
                                break;
                            case 'forumProfile':
                                await this.db.appSettings.delete(FORUM_PROFILE_KEY);
                                break;
                            case 'apiChatSettings':
                                await this.db.appSettings.delete(API_CHAT_SETTINGS_KEY);
                                break;
                            case 'apiVoiceSettings':
                                await this.db.appSettings.delete(API_VOICE_SETTINGS_KEY);
                                break;
                            case 'securitySettings':
                                await this.db.appSettings.delete(SECURITY_SETTINGS_KEY);
                                break;
                            default:
                                break;
                        }
                    }
                });
            }

            async getManagedDataStats() {
                const [musicCount, worldbookCount, archiveCount, forumProfile, apiChatSettings, apiVoiceSettings, securitySettings] = await Promise.all([
                    this.db.music.count(),
                    this.db.worldbook.count(),
                    this.db.archiveProfiles.count(),
                    this.db.appSettings.get(FORUM_PROFILE_KEY),
                    this.db.appSettings.get(API_CHAT_SETTINGS_KEY),
                    this.db.appSettings.get(API_VOICE_SETTINGS_KEY),
                    this.db.appSettings.get(SECURITY_SETTINGS_KEY)
                ]);

                return {
                    music: { count: musicCount },
                    worldbook: { count: worldbookCount },
                    archiveProfiles: { count: archiveCount },
                    forumProfile: {
                        saved: Boolean(forumProfile),
                        updatedAt: Number(forumProfile?.updatedAt) || 0
                    },
                    apiChatSettings: {
                        saved: Boolean(apiChatSettings),
                        updatedAt: Number(apiChatSettings?.updatedAt) || 0
                    },
                    apiVoiceSettings: {
                        saved: Boolean(apiVoiceSettings),
                        updatedAt: Number(apiVoiceSettings?.updatedAt) || 0
                    },
                    securitySettings: {
                        saved: Boolean(securitySettings),
                        enabled: securitySettings ? Boolean(securitySettings.enabled) : true,
                        updatedAt: Number(securitySettings?.updatedAt) || 0
                    }
                };
            }
        }

        const appDB = new YuAppDatabase();
        const FORUM_PROFILE_FORM_IDS = {
            name: 'profile-form-name',
            profileId: 'profile-form-id',
            bio: 'profile-form-bio',
            location: 'profile-form-location',
            email: 'profile-form-email',
            website: 'profile-form-website'
        };
        const CHAT_PROFILE_FORM_IDS = {
            name: 'chat-profile-form-name',
            profileId: 'chat-profile-form-id',
            bio: 'chat-profile-form-bio',
            location: 'chat-profile-form-location',
            email: 'chat-profile-form-email',
            website: 'chat-profile-form-website'
        };
        const DEFAULT_FORUM_PROFILE = {
            key: FORUM_PROFILE_KEY,
            name: '点击编辑昵称',
            profileId: '点击编辑ID',
            bio: '',
            location: '',
            email: '',
            website: '',
            avatarFile: null,
            backgroundFile: null,
            updatedAt: 0
        };
        const DEFAULT_API_CHAT_SETTINGS = {
            key: API_CHAT_SETTINGS_KEY,
            presetName: '默认预设',
            apiUrl: '',
            apiKey: '',
            model: '',
            modelOptions: [],
            temperature: 1,
            contextCount: 20,
            updatedAt: 0,
            lastModelSyncAt: 0,
            lastModelSyncSource: ''
        };
        const DEFAULT_API_VOICE_SETTINGS = {
            key: API_VOICE_SETTINGS_KEY,
            presetName: '默认语音',
            edition: 'domestic',
            apiKey: '',
            groupId: '',
            speed: 1,
            language: 'zh-CN',
            updatedAt: 0
        };
        const DEFAULT_SECURITY_SETTINGS = {
            key: SECURITY_SETTINGS_KEY,
            enabled: true,
            password: '2020',
            updatedAt: 0
        };
        let forumProfileState = { ...DEFAULT_FORUM_PROFILE };
        let apiChatSettingsState = { ...DEFAULT_API_CHAT_SETTINGS };
        let apiVoiceSettingsState = { ...DEFAULT_API_VOICE_SETTINGS };
        let securitySettingsState = { ...DEFAULT_SECURITY_SETTINGS };
        let securityFormState = {
            enabled: DEFAULT_SECURITY_SETTINGS.enabled
        };
        let profileSaveFeedbackTimer = null;
        let apiChatSaveFeedbackTimer = null;
        let apiVoiceSaveFeedbackTimer = null;
        let apiChatDraftPersistTimer = null;
        let apiVoiceDraftPersistTimer = null;
        let apiChatDraftUpdatedAt = 0;
        let apiVoiceDraftUpdatedAt = 0;
        let apiChatModelPullInFlight = false;

        // 时钟
        function updateTime() {
            const now = new Date();
            let h = now.getHours().toString().padStart(2, '0');
            let m = now.getMinutes().toString().padStart(2, '0');
            document.getElementById('clock').innerText = `${h}:${m}`;
            document.getElementById('pure-lock-clock').innerText = `${h}:${m}`;
            document.getElementById('pass-clock').innerText = `${h}:${m}`;
            const days = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
            document.getElementById('cal-day').innerText = now.getDate();
            document.getElementById('cal-date').innerText = `${days[now.getDay()]}, ${(now.getMonth()+1)}月`;
        }
        setInterval(updateTime, 1000); updateTime();
        void initSecuritySettingsData();

        // 基础交互音效
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        const audioCtx = new AudioContext();
        
        function playBeep() {
            if(audioCtx.state === 'suspended') audioCtx.resume();
            const oscillator = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();
            oscillator.frequency.value = 800;
            gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);
            oscillator.connect(gainNode); gainNode.connect(audioCtx.destination);
            oscillator.start(); oscillator.stop(audioCtx.currentTime + 0.1);
        }

        function goToPasswordScreen() {
            const pureLock = document.getElementById('pure-lock-screen');
            const passwordScreen = document.getElementById('password-screen');
            pureLock.style.transform = 'translateY(-100%)'; pureLock.style.opacity = '0';
            if (securitySettingsState.enabled) {
                passwordScreen.style.display = 'flex';
                passwordScreen.style.opacity = '1';
                setTimeout(() => pureLock.style.display = 'none', 500);
                return;
            }

            setTimeout(() => {
                pureLock.style.display = 'none';
                unlock(true);
            }, 320);
        }

        let password = "";
        const dots = document.querySelectorAll('.dot');

        function updateDots() { dots.forEach((dot, index) => { dot.classList.toggle('active', index < password.length); }); }
        function pressKey(num) {
            playBeep();
            if (password.length < LOCK_PASSWORD_LENGTH) {
                password += num; updateDots();
                if (password.length === LOCK_PASSWORD_LENGTH) {
                    setTimeout(() => {
                        if (password === securitySettingsState.password) unlock();
                        else {
                            const dc = document.getElementById('dots-container');
                            dc.classList.add('shake');
                            setTimeout(() => { dc.classList.remove('shake'); clearPass(false); }, 400);
                        }
                    }, 200);
                }
            }
        }
        function deletePass() { playBeep(); password = password.slice(0, -1); updateDots(); }
        function clearPass(beep = true) { if(beep) playBeep(); password = ""; updateDots(); }

        function unlock(skipPasswordTransition = false) {
            if(audioCtx.state === 'suspended') audioCtx.resume();
            const passwordScreen = document.getElementById('password-screen');
            const homeScreen = document.getElementById('home-screen');
            if (skipPasswordTransition) {
                passwordScreen.style.display = 'none';
                homeScreen.style.display = 'flex';
                homeScreen.style.opacity = '1';
            } else {
                passwordScreen.style.opacity = '0';
                setTimeout(() => {
                    passwordScreen.style.display = 'none'; homeScreen.style.display = 'flex';
                    setTimeout(() => homeScreen.style.opacity = '1', 50);
                }, 500);
            }
            initMusicData();
            initWorldbookData();
            initArchiveData();
            initChatRoleThreadsData();
            initForumProfileData();
            initApiChatSettingsData();
            initApiVoiceSettingsData();
        }

        function clearElementObjectUrl(element) {
            if (element && element.dataset.objectUrl) {
                URL.revokeObjectURL(element.dataset.objectUrl);
                delete element.dataset.objectUrl;
            }
        }

        function setBackgroundFilePreview(element, file, fallbackHtml = '') {
            if (!element) return;
            clearElementObjectUrl(element);

            if (file instanceof Blob) {
                const objectUrl = URL.createObjectURL(file);
                element.dataset.objectUrl = objectUrl;
                element.style.backgroundImage = `url("${objectUrl}")`;
                element.innerHTML = '';
                element.classList.add('has-image');
                return;
            }

            element.style.backgroundImage = 'none';
            element.innerHTML = fallbackHtml;
            element.classList.remove('has-image');
        }

        function formatArchiveDate(timestamp) {
            if (!timestamp) return '刚刚更新';
            const date = new Date(timestamp);
            const month = `${date.getMonth() + 1}`.padStart(2, '0');
            const day = `${date.getDate()}`.padStart(2, '0');
            return `${month}/${day} 更新`;
        }

        async function initForumProfileData() {
            const savedProfile = await appDB.getForumProfile();
            forumProfileState = {
                ...DEFAULT_FORUM_PROFILE,
                ...(savedProfile || {})
            };
            populateForumProfileForm();
            populateChatProfileForm();
            applyForumProfileUI();
        }

        async function persistForumProfileState() {
            forumProfileState.updatedAt = Date.now();
            await appDB.saveForumProfile(forumProfileState);
        }

        function readLocalJsonValue(key) {
            try {
                const raw = window.localStorage?.getItem(key);
                return raw ? JSON.parse(raw) : null;
            } catch (error) {
                return null;
            }
        }

        function writeLocalJsonValue(key, value) {
            try {
                if (!window.localStorage) return false;
                window.localStorage.setItem(key, JSON.stringify(value));
                return true;
            } catch (error) {
                return false;
            }
        }

        function removeLocalJsonValue(key) {
            try {
                window.localStorage?.removeItem(key);
            } catch (error) {
                // ignore local draft cleanup errors
            }
        }

        function normalizeApiChatSettingsState(settings = {}) {
            const temperature = Number.parseFloat(settings.temperature);
            const contextCount = Number.parseInt(settings.contextCount, 10);
            const modelOptions = Array.isArray(settings.modelOptions)
                ? [...new Set(settings.modelOptions.map(item => String(item || '').trim()).filter(Boolean))]
                : [];

            return {
                ...DEFAULT_API_CHAT_SETTINGS,
                ...settings,
                presetName: String(settings.presetName || DEFAULT_API_CHAT_SETTINGS.presetName).trim() || DEFAULT_API_CHAT_SETTINGS.presetName,
                apiUrl: String(settings.apiUrl || '').trim(),
                apiKey: String(settings.apiKey || '').trim(),
                model: String(settings.model || '').trim(),
                modelOptions,
                temperature: Number.isFinite(temperature) ? Math.min(2, Math.max(0, temperature)) : DEFAULT_API_CHAT_SETTINGS.temperature,
                contextCount: Number.isNaN(contextCount) ? DEFAULT_API_CHAT_SETTINGS.contextCount : Math.max(0, contextCount),
                updatedAt: Number(settings.updatedAt) || 0,
                lastModelSyncAt: Number(settings.lastModelSyncAt) || 0,
                lastModelSyncSource: String(settings.lastModelSyncSource || '').trim()
            };
        }

        async function initApiChatSettingsData() {
            const savedSettings = await appDB.getApiChatSettings();
            const draftSettings = readLocalJsonValue(API_CHAT_DRAFT_STORAGE_KEY) || {};
            const { draftUpdatedAt, ...draftPayload } = draftSettings;
            apiChatDraftUpdatedAt = Number(draftUpdatedAt) || 0;
            apiChatSettingsState = normalizeApiChatSettingsState({
                ...(savedSettings || {}),
                ...draftPayload
            });
            populateApiChatForm();
        }

        async function persistApiChatSettingsState() {
            apiChatSettingsState.updatedAt = Date.now();
            await appDB.saveApiChatSettings(apiChatSettingsState);
        }

        function handleApiChatContentClick(event) {
            if (event) event.stopPropagation();
        }

        function normalizeApiVoiceSettingsState(settings = {}) {
            const normalizedSpeed = Number.parseFloat(settings.speed);
            const normalizedEdition = ['domestic', 'overseas'].includes(settings.edition) ? settings.edition : DEFAULT_API_VOICE_SETTINGS.edition;

            return {
                ...DEFAULT_API_VOICE_SETTINGS,
                ...settings,
                presetName: String(settings.presetName || DEFAULT_API_VOICE_SETTINGS.presetName).trim() || DEFAULT_API_VOICE_SETTINGS.presetName,
                edition: normalizedEdition,
                apiKey: String(settings.apiKey || '').trim(),
                groupId: String(settings.groupId || '').trim(),
                speed: Number.isFinite(normalizedSpeed) ? Math.min(3, Math.max(0.2, normalizedSpeed)) : DEFAULT_API_VOICE_SETTINGS.speed,
                language: String(settings.language || DEFAULT_API_VOICE_SETTINGS.language).trim() || DEFAULT_API_VOICE_SETTINGS.language,
                updatedAt: Number(settings.updatedAt) || 0
            };
        }

        async function initApiVoiceSettingsData() {
            const savedSettings = await appDB.getApiVoiceSettings();
            const draftSettings = readLocalJsonValue(API_VOICE_DRAFT_STORAGE_KEY) || {};
            const { draftUpdatedAt, ...draftPayload } = draftSettings;
            apiVoiceDraftUpdatedAt = Number(draftUpdatedAt) || 0;
            apiVoiceSettingsState = normalizeApiVoiceSettingsState({
                ...(savedSettings || {}),
                ...draftPayload
            });
            populateApiVoiceForm();
        }

        async function persistApiVoiceSettingsState() {
            apiVoiceSettingsState.updatedAt = Date.now();
            await appDB.saveApiVoiceSettings(apiVoiceSettingsState);
        }

        function handleApiVoiceContentClick(event) {
            if (event) event.stopPropagation();
        }

        function sanitizeLockPassword(value = '') {
            return String(value || '').replace(/\D/g, '').slice(0, LOCK_PASSWORD_LENGTH);
        }

        function normalizeSecuritySettingsState(settings = {}) {
            const password = sanitizeLockPassword(settings.password || DEFAULT_SECURITY_SETTINGS.password) || DEFAULT_SECURITY_SETTINGS.password;
            return {
                ...DEFAULT_SECURITY_SETTINGS,
                ...settings,
                enabled: settings.enabled === undefined ? DEFAULT_SECURITY_SETTINGS.enabled : Boolean(settings.enabled),
                password,
                updatedAt: Number(settings.updatedAt) || 0
            };
        }

        function applySecuritySettingsUI() {
            const passwordHint = document.querySelector('.password-hint');
            const passwordScreen = document.getElementById('password-screen');
            const homeScreen = document.getElementById('home-screen');

            if (passwordHint) {
                passwordHint.innerText = securitySettingsState.enabled ? '请输入密码' : '锁屏密码已关闭';
            }

            if (!passwordScreen || !homeScreen) return;

            if (!securitySettingsState.enabled && homeScreen.style.display !== 'flex') {
                passwordScreen.style.display = 'none';
                return;
            }

            if (securitySettingsState.enabled && homeScreen.style.display !== 'flex') {
                passwordScreen.style.display = 'flex';
                passwordScreen.style.opacity = '1';
            }
        }

        async function initSecuritySettingsData() {
            const savedSettings = await appDB.getSecuritySettings();
            securitySettingsState = normalizeSecuritySettingsState(savedSettings || {});
            applySecuritySettingsUI();
            populateSecurityForm();
        }

        function handleSecurityContentClick(event) {
            if (event) event.stopPropagation();
        }

        function handleDataManagementContentClick(event) {
            if (event) event.stopPropagation();
        }

        function handleLegalContentClick(event) {
            if (event) event.stopPropagation();
        }

        function closeInfoModal(event) {
            if (event && event.target !== event.currentTarget) return;
            toggleModal('info-modal', false);
        }

        function openInfoModal(title, html) {
            const titleElement = document.getElementById('info-modal-title');
            const bodyElement = document.getElementById('info-modal-body');
            if (!titleElement || !bodyElement) return;

            titleElement.innerText = title || '说明';
            bodyElement.innerHTML = html || '';
            toggleModal('info-modal', true);
            feather.replace({ 'stroke-width': 1.2 });
        }

        function buildInfoModalHtml(config = {}) {
            const introHtml = config.intro
                ? `<div class="info-modal-intro">${escapeHtml(config.intro)}</div>`
                : '';
            const sectionsHtml = Array.isArray(config.sections)
                ? config.sections.map(section => `
                    <div class="info-modal-section">
                        <div class="info-modal-section-title">${escapeHtml(section.title || '')}</div>
                        <ul class="info-modal-list">
                            ${(Array.isArray(section.items) ? section.items : []).map(item => `<li>${escapeHtml(item)}</li>`).join('')}
                        </ul>
                    </div>
                `).join('')
                : '';
            const noteHtml = config.note
                ? `<div class="info-modal-note">${escapeHtml(config.note)}</div>`
                : '';

            return `${introHtml}${sectionsHtml}${noteHtml}`;
        }

        function openLegalModal(mode, event = null) {
            if (event) event.stopPropagation();
            const content = LEGAL_MODAL_CONTENT[mode];
            if (!content) return;
            openInfoModal(content.title, buildInfoModalHtml(content));
        }

        function showOperationResultModal(title, lines = [], note = '') {
            const html = buildInfoModalHtml({
                sections: [
                    {
                        title,
                        items: lines.filter(Boolean)
                    }
                ],
                note
            });
            openInfoModal(title, html);
        }

        function sanitizePasswordInput(event) {
            if (event) event.stopPropagation();
            if (!event?.target) return;
            event.target.value = sanitizeLockPassword(event.target.value);
        }

        function setSecurityStatus(message, tone = 'default') {
            const element = document.getElementById('security-status');
            if (!element) return;
            element.innerText = message;
            if (tone === 'default') delete element.dataset.tone;
            else element.dataset.tone = tone;
        }

        function renderSecurityFormState() {
            const toggleButton = document.getElementById('security-enabled-btn');
            const copy = document.getElementById('security-switch-copy');
            if (!toggleButton || !copy) return;

            toggleButton.classList.toggle('active', securityFormState.enabled);
            toggleButton.classList.toggle('danger', !securityFormState.enabled);
            toggleButton.innerText = securityFormState.enabled ? '已开启' : '已关闭';
            copy.innerText = securityFormState.enabled
                ? '已开启，解锁需输入 4 位数字密码。'
                : '已关闭，点击锁屏后可直接进入桌面。';
        }

        function populateSecurityForm() {
            securityFormState.enabled = Boolean(securitySettingsState.enabled);
            const currentInput = document.getElementById('security-current-password');
            const newInput = document.getElementById('security-new-password');
            const confirmInput = document.getElementById('security-confirm-password');

            if (currentInput) currentInput.value = '';
            if (newInput) newInput.value = '';
            if (confirmInput) confirmInput.value = '';

            renderSecurityFormState();

            if (securitySettingsState.updatedAt) {
                setSecurityStatus(
                    securitySettingsState.enabled
                        ? `锁屏密码已开启，最近保存于 ${formatApiChatTime(securitySettingsState.updatedAt)}。`
                        : `锁屏密码已关闭，最近保存于 ${formatApiChatTime(securitySettingsState.updatedAt)}。`,
                    'success'
                );
                return;
            }

            setSecurityStatus('当前锁屏密码默认开启，可随时关闭或改成新的 4 位数字密码。');
        }

        function toggleSecurityEnabled(event) {
            if (event) event.stopPropagation();
            securityFormState.enabled = !securityFormState.enabled;
            renderSecurityFormState();
        }

        async function saveSecuritySettings(event) {
            if (event) event.stopPropagation();

            const currentPassword = sanitizeLockPassword(document.getElementById('security-current-password')?.value || '');
            const newPassword = sanitizeLockPassword(document.getElementById('security-new-password')?.value || '');
            const confirmPassword = sanitizeLockPassword(document.getElementById('security-confirm-password')?.value || '');
            const isChangingEnabled = securityFormState.enabled !== securitySettingsState.enabled;
            const isChangingPassword = newPassword.length > 0 || confirmPassword.length > 0;

            if (securitySettingsState.enabled && (isChangingEnabled || isChangingPassword) && currentPassword !== securitySettingsState.password) {
                setSecurityStatus('请输入当前 4 位锁屏密码后再保存。', 'error');
                document.getElementById('security-current-password')?.focus();
                return;
            }

            if (isChangingPassword) {
                if (newPassword.length !== LOCK_PASSWORD_LENGTH) {
                    setSecurityStatus('新密码必须是 4 位数字。', 'error');
                    document.getElementById('security-new-password')?.focus();
                    return;
                }
                if (confirmPassword !== newPassword) {
                    setSecurityStatus('两次输入的新密码不一致。', 'error');
                    document.getElementById('security-confirm-password')?.focus();
                    return;
                }
            }

            securitySettingsState = normalizeSecuritySettingsState({
                ...securitySettingsState,
                enabled: securityFormState.enabled,
                password: isChangingPassword ? newPassword : securitySettingsState.password,
                updatedAt: Date.now()
            });

            await appDB.saveSecuritySettings(securitySettingsState);
            applySecuritySettingsUI();
            populateSecurityForm();
            setSecurityStatus(
                securitySettingsState.enabled
                    ? (isChangingPassword ? '锁屏密码已更新并保持开启。' : '锁屏安全设置已保存。')
                    : '锁屏密码已关闭，可随时重新开启。',
                'success'
            );
            await refreshDataManagementPanel();
        }

        function lockDeviceNow(event) {
            if (event) event.stopPropagation();

            const settingsScreen = document.getElementById('settings-screen');
            const homeScreen = document.getElementById('home-screen');
            const pureLock = document.getElementById('pure-lock-screen');
            const passwordScreen = document.getElementById('password-screen');

            clearPass(false);

            if (settingsScreen) {
                settingsScreen.style.opacity = '0';
                settingsScreen.style.display = 'none';
            }
            if (homeScreen) {
                homeScreen.style.opacity = '0';
                homeScreen.style.display = 'none';
            }
            if (passwordScreen) {
                passwordScreen.style.opacity = '1';
                passwordScreen.style.display = securitySettingsState.enabled ? 'flex' : 'none';
            }
            if (pureLock) {
                pureLock.style.display = 'flex';
                pureLock.style.opacity = '1';
                pureLock.style.transform = 'translateY(0)';
            }
        }

        function setDataManagementStatus(message, tone = 'default') {
            const element = document.getElementById('data-management-status');
            if (!element) return;
            element.innerText = message;
            if (tone === 'default') delete element.dataset.tone;
            else element.dataset.tone = tone;
        }

        function getSelectedDataGroupKeys() {
            return DATA_GROUP_DEFINITIONS
                .filter(definition => document.getElementById(`data-scope-${definition.key}`)?.checked)
                .map(definition => definition.key);
        }

        function formatSelectedDataGroupLabels(groupKeys = []) {
            return DATA_GROUP_DEFINITIONS
                .filter(definition => groupKeys.includes(definition.key))
                .map(definition => definition.label)
                .join('、');
        }

        function setAllDataScopeSelection(checked, event = null) {
            if (event) event.stopPropagation();
            DATA_GROUP_DEFINITIONS.forEach(definition => {
                const checkbox = document.getElementById(`data-scope-${definition.key}`);
                if (checkbox) checkbox.checked = checked;
            });
        }

        function formatManagedDataSummary(groupKey, stat = {}) {
            switch (groupKey) {
                case 'music':
                case 'worldbook':
                case 'archiveProfiles':
                    return `${Number(stat.count) || 0} 条`;
                case 'forumProfile':
                case 'apiChatSettings':
                case 'apiVoiceSettings':
                    return stat.saved ? (stat.updatedAt ? `已保存 ${formatApiChatTime(stat.updatedAt)}` : '已保存') : '未保存';
                case 'securitySettings':
                    if (!stat.saved) return DEFAULT_SECURITY_SETTINGS.enabled ? '默认开启' : '默认关闭';
                    return stat.enabled ? '已开启' : '已关闭';
                default:
                    return '未统计';
            }
        }

        async function refreshDataManagementPanel() {
            const stats = await appDB.getManagedDataStats();
            DATA_GROUP_DEFINITIONS.forEach(definition => {
                const summary = document.getElementById(`data-scope-summary-${definition.key}`);
                if (!summary) return;
                summary.innerText = formatManagedDataSummary(definition.key, stats[definition.key] || {});
            });
        }

        function formatDataExportFilename(date = new Date()) {
            const year = `${date.getFullYear()}`;
            const month = `${date.getMonth() + 1}`.padStart(2, '0');
            const day = `${date.getDate()}`.padStart(2, '0');
            const hour = `${date.getHours()}`.padStart(2, '0');
            const minute = `${date.getMinutes()}`.padStart(2, '0');
            const second = `${date.getSeconds()}`.padStart(2, '0');
            return `Yu-${year}-${month}-${day}-${hour}-${minute}-${second}.json`;
        }

        function downloadBlobFile(blob, fileName) {
            const url = URL.createObjectURL(blob);
            const anchor = document.createElement('a');
            anchor.href = url;
            anchor.download = fileName;
            document.body.appendChild(anchor);
            anchor.click();
            anchor.remove();
            setTimeout(() => URL.revokeObjectURL(url), 1000);
        }

        function blobToDataUrl(blob) {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result);
                reader.onerror = () => reject(reader.error || new Error('读取文件失败'));
                reader.readAsDataURL(blob);
            });
        }

        async function serializeForExport(value) {
            if (value instanceof File) {
                return {
                    __yuType: 'file',
                    name: value.name || 'file',
                    mimeType: value.type || 'application/octet-stream',
                    lastModified: Number(value.lastModified) || Date.now(),
                    dataUrl: await blobToDataUrl(value)
                };
            }

            if (value instanceof Blob) {
                return {
                    __yuType: 'blob',
                    mimeType: value.type || 'application/octet-stream',
                    dataUrl: await blobToDataUrl(value)
                };
            }

            if (Array.isArray(value)) {
                const result = [];
                for (const item of value) result.push(await serializeForExport(item));
                return result;
            }

            if (value && typeof value === 'object') {
                const result = {};
                for (const [key, item] of Object.entries(value)) {
                    result[key] = await serializeForExport(item);
                }
                return result;
            }

            return value;
        }

        async function dataUrlToBlob(dataUrl = '') {
            const response = await fetch(dataUrl);
            if (!response.ok) throw new Error('无法解析备份文件中的二进制资源');
            return response.blob();
        }

        async function deserializeImportedValue(value) {
            if (Array.isArray(value)) {
                const result = [];
                for (const item of value) result.push(await deserializeImportedValue(item));
                return result;
            }

            if (value && typeof value === 'object') {
                if (value.__yuType === 'file' && value.dataUrl) {
                    const blob = await dataUrlToBlob(value.dataUrl);
                    return new File([blob], value.name || 'file', {
                        type: value.mimeType || blob.type || 'application/octet-stream',
                        lastModified: Number(value.lastModified) || Date.now()
                    });
                }

                if (value.__yuType === 'blob' && value.dataUrl) {
                    const blob = await dataUrlToBlob(value.dataUrl);
                    if (value.mimeType && blob.type !== value.mimeType) {
                        return new Blob([blob], { type: value.mimeType });
                    }
                    return blob;
                }

                const result = {};
                for (const [key, item] of Object.entries(value)) {
                    result[key] = await deserializeImportedValue(item);
                }
                return result;
            }

            return value;
        }

        async function refreshAllManagedData() {
            await initSecuritySettingsData();
            await initMusicData();
            await initWorldbookData();
            await initArchiveData();
            await initForumProfileData();
            await initApiChatSettingsData();
            await initApiVoiceSettingsData();
            await refreshDataManagementPanel();
        }

        function triggerDataImport(event) {
            if (event) event.stopPropagation();

            const selectedKeys = getSelectedDataGroupKeys();
            if (!selectedKeys.length) {
                setDataManagementStatus('请先勾选至少一类数据再导入。', 'error');
                return;
            }

            document.getElementById('data-import-file')?.click();
        }

        function extractImportPayload(parsedFile) {
            if (!parsedFile || typeof parsedFile !== 'object') return null;
            if (parsedFile.payload && typeof parsedFile.payload === 'object') return parsedFile.payload;
            if (parsedFile.data && typeof parsedFile.data === 'object') return parsedFile.data;
            return null;
        }

        async function exportSelectedData(event) {
            if (event) event.stopPropagation();

            const selectedKeys = getSelectedDataGroupKeys();
            if (!selectedKeys.length) {
                setDataManagementStatus('请先勾选至少一类数据再导出。', 'error');
                return;
            }

            setDataManagementStatus('正在整理已选数据并生成备份文件...', 'working');

            try {
                const rawPayload = await appDB.getManagedDataPayload(selectedKeys);
                const serializedPayload = await serializeForExport(rawPayload);
                const exportFile = {
                    meta: {
                        app: 'Yu',
                        version: DATA_EXPORT_VERSION,
                        exportedAt: new Date().toISOString(),
                        groups: selectedKeys
                    },
                    payload: serializedPayload
                };
                const fileName = formatDataExportFilename(new Date());
                const blob = new Blob([JSON.stringify(exportFile, null, 2)], { type: 'application/json;charset=utf-8' });

                downloadBlobFile(blob, fileName);
                setDataManagementStatus(`已导出 ${formatSelectedDataGroupLabels(selectedKeys)}，文件名为 ${fileName}。`, 'success');
                showOperationResultModal(
                    '批量导出完成',
                    [
                        `已导出：${formatSelectedDataGroupLabels(selectedKeys)}`,
                        `文件名：${fileName}`
                    ],
                    '弹窗仅会在你主动点击批量操作按钮后显示。'
                );
            } catch (error) {
                setDataManagementStatus(`导出失败：${error?.message || '未知错误'}`, 'error');
            }
        }

        async function handleDataImportFile(event) {
            if (event) event.stopPropagation();

            const input = event?.target;
            const file = input?.files?.[0];
            if (!file) return;

            try {
                const selectedKeys = getSelectedDataGroupKeys();
                if (!selectedKeys.length) {
                    setDataManagementStatus('请先勾选至少一类数据再导入。', 'error');
                    return;
                }

                if (!confirm(`将使用备份文件覆盖已选数据：${formatSelectedDataGroupLabels(selectedKeys)}。此操作会替换本地同类数据，是否继续？`)) {
                    return;
                }

                setDataManagementStatus('正在读取备份文件并导入数据...', 'working');
                const parsedFile = JSON.parse(await file.text());
                if (parsedFile?.meta?.app && parsedFile.meta.app !== 'Yu') {
                    throw new Error('文件不是 Yu 导出的备份');
                }

                const payload = extractImportPayload(parsedFile);
                if (!payload) {
                    throw new Error('文件格式不正确，请选择 Yu 导出的 JSON 备份');
                }

                const availableKeys = selectedKeys.filter(key => Object.prototype.hasOwnProperty.call(payload, key));
                const missingKeys = selectedKeys.filter(key => !availableKeys.includes(key));

                if (!availableKeys.length) {
                    throw new Error('备份文件中不包含当前勾选的数据类型');
                }

                const selectedPayload = {};
                availableKeys.forEach(key => {
                    selectedPayload[key] = payload[key];
                });

                const restoredPayload = await deserializeImportedValue(selectedPayload);
                await appDB.replaceManagedData(restoredPayload, availableKeys);
                await refreshAllManagedData();

                const importStatusMessage =
                    missingKeys.length
                        ? `已导入 ${formatSelectedDataGroupLabels(availableKeys)}，跳过文件中不存在的 ${formatSelectedDataGroupLabels(missingKeys)}。`
                        : `已成功导入 ${formatSelectedDataGroupLabels(availableKeys)}。`;

                setDataManagementStatus(
                    importStatusMessage,
                    missingKeys.length ? 'warning' : 'success'
                );
                showOperationResultModal(
                    '批量导入完成',
                    [
                        `已导入：${formatSelectedDataGroupLabels(availableKeys)}`,
                        missingKeys.length ? `已跳过：${formatSelectedDataGroupLabels(missingKeys)}` : ''
                    ],
                    missingKeys.length ? '备份文件中缺少的勾选项不会被覆盖。' : '所选数据已按备份内容完成覆盖。'
                );
            } catch (error) {
                setDataManagementStatus(`导入失败：${error?.message || '未知错误'}`, 'error');
            } finally {
                if (input) input.value = '';
            }
        }

        async function clearSelectedData(event) {
            if (event) event.stopPropagation();

            const selectedKeys = getSelectedDataGroupKeys();
            if (!selectedKeys.length) {
                setDataManagementStatus('请先勾选至少一类数据再清空。', 'error');
                return;
            }

            const labels = formatSelectedDataGroupLabels(selectedKeys);
            if (!confirm(`确认清空以下本地数据吗：${labels}？此操作不可撤销。`)) return;

            setDataManagementStatus(`正在清空 ${labels}...`, 'working');

            try {
                await appDB.clearManagedData(selectedKeys);
                await refreshAllManagedData();
                setDataManagementStatus(`已清空 ${labels}。`, 'success');
                showOperationResultModal(
                    '批量清空完成',
                    [
                        `已清空：${labels}`
                    ],
                    '该操作已生效，如需恢复请使用此前导出的备份文件重新导入。'
                );
            } catch (error) {
                setDataManagementStatus(`清空失败：${error?.message || '未知错误'}`, 'error');
            }
        }

        function guessDefaultSchemeForApi(rawUrl = '') {
            const value = String(rawUrl || '').trim().toLowerCase();
            const isPrivateTarget = /^(localhost|0\.0\.0\.0|127(?:\.\d{1,3}){3}|10(?:\.\d{1,3}){3}|192\.168(?:\.\d{1,3}){2}|172\.(1[6-9]|2\d|3[01])(?:\.\d{1,3}){2}|\[?::1\]?)(:\d+)?(\/|$)/.test(value);
            return isPrivateTarget ? 'http://' : 'https://';
        }

        function normalizeApiBaseUrl(rawUrl = '') {
            const input = String(rawUrl || '').trim();
            if (!input) return '';

            const withScheme = /^[a-zA-Z][a-zA-Z\d+.-]*:\/\//.test(input)
                ? input
                : `${guessDefaultSchemeForApi(input)}${input}`;

            try {
                const url = new URL(withScheme);
                const sanitizedPath = url.pathname
                    .replace(/\/(chat\/completions?|completions?|api\/chat|api\/generate)\/?$/i, '')
                    .replace(/\/+$/, '');
                return `${url.origin}${sanitizedPath}`;
            } catch (error) {
                return '';
            }
        }

        function isPrivateOrLocalHost(hostname = '') {
            const host = String(hostname || '').toLowerCase();
            if (!host) return false;
            if (host === 'localhost' || host === '0.0.0.0' || host === '::1' || host.endsWith('.local') || host.endsWith('.lan')) return true;
            if (/^127(?:\.\d{1,3}){3}$/.test(host)) return true;
            if (/^10(?:\.\d{1,3}){3}$/.test(host)) return true;
            if (/^192\.168(?:\.\d{1,3}){2}$/.test(host)) return true;

            const match = host.match(/^172\.(\d{1,3})(?:\.\d{1,3}){2}$/);
            if (!match) return false;
            const secondOctet = Number(match[1]);
            return secondOctet >= 16 && secondOctet <= 31;
        }

        function detectApiChatProviderKind(apiUrl = '') {
            if (!apiUrl) return '兼容 API';

            try {
                const { hostname } = new URL(apiUrl);
                const host = hostname.toLowerCase();

                if (isPrivateOrLocalHost(host)) return '自营 API';

                const domesticKeywords = ['aliyun', 'alibaba', 'baidu', 'tencent', 'huawei', 'volc', 'volces', 'deepseek', 'moonshot', 'siliconflow', 'glm', 'zhipu', 'stepfun', 'qwen', '.cn'];
                if (domesticKeywords.some(keyword => host.includes(keyword))) return '国内 API';

                const overseasKeywords = ['openai', 'anthropic', 'openrouter', 'together', 'groq', 'x.ai', 'perplexity'];
                if (overseasKeywords.some(keyword => host.includes(keyword))) return '外网 API';

                return '兼容 API';
            } catch (error) {
                return '兼容 API';
            }
        }

        function formatApiChatTime(timestamp) {
            if (!timestamp) return '';
            const date = new Date(timestamp);
            const month = `${date.getMonth() + 1}`.padStart(2, '0');
            const day = `${date.getDate()}`.padStart(2, '0');
            const hour = `${date.getHours()}`.padStart(2, '0');
            const minute = `${date.getMinutes()}`.padStart(2, '0');
            return `${month}/${day} ${hour}:${minute}`;
        }

        function setApiChatStatus(message, tone = 'default') {
            const element = document.getElementById('api-chat-status');
            if (!element) return;
            element.innerText = message;
            if (tone === 'default') delete element.dataset.tone;
            else element.dataset.tone = tone;
        }

        function setApiChatModelStatus(message, tone = 'default') {
            const element = document.getElementById('api-chat-model-status');
            if (!element) return;
            element.innerText = message;
            if (tone === 'default') delete element.dataset.tone;
            else element.dataset.tone = tone;
        }

        function renderApiChatCompatibilityHint(rawUrl = '') {
            const hint = document.getElementById('api-chat-compatibility-hint');
            if (!hint) return;

            const trimmed = String(rawUrl || '').trim();
            const normalized = normalizeApiBaseUrl(trimmed);

            if (!trimmed) {
                delete hint.dataset.tone;
                hint.innerText = '支持外网 API、国内 API 与自营 API，自动兼容 OpenAI 风格 `/models`，并额外尝试自营服务常见的 `/api/tags`。';
                return;
            }

            if (!normalized) {
                hint.dataset.tone = 'error';
                hint.innerText = '当前接口网址无法识别，请输入完整域名或可访问的局域网地址。';
                return;
            }

            const providerKind = detectApiChatProviderKind(normalized);
            hint.dataset.tone = 'success';
            hint.innerText = `已识别为 ${providerKind}，请求基址会按 ${normalized} 兼容处理。若接口地址直接填到 /chat/completions，也会自动回退到上级基址。`;
        }

        function updateApiChatTemperatureValue(value) {
            const output = document.getElementById('api-chat-temperature-value');
            if (!output) return;
            const numericValue = Number.parseFloat(value);
            output.innerText = Number.isFinite(numericValue) ? numericValue.toFixed(1) : DEFAULT_API_CHAT_SETTINGS.temperature.toFixed(1);
        }

        function renderApiChatModelOptions() {
            const list = document.getElementById('api-chat-model-modal-list');
            if (!list) return;

            const modelInput = document.getElementById('api-chat-model');
            const searchInput = document.getElementById('api-chat-model-search');
            const keyword = String(searchInput?.value || '').trim().toLowerCase();
            const options = apiChatSettingsState.modelOptions || [];
            const filteredOptions = keyword
                ? options.filter(modelId => modelId.toLowerCase().includes(keyword))
                : options;

            list.innerHTML = '';
            syncApiChatModelPreview();

            if (!options.length) {
                const empty = document.createElement('div');
                empty.className = 'api-chat-model-empty';
                empty.innerText = '还没有可选模型，先点击右侧“拉取”。';
                list.appendChild(empty);
                return;
            }

            if (!filteredOptions.length) {
                const empty = document.createElement('div');
                empty.className = 'api-chat-model-empty';
                empty.innerText = '当前关键字没有匹配模型，请继续输入或清空后查看全部。';
                list.appendChild(empty);
                return;
            }

            filteredOptions.forEach(modelId => {
                const option = document.createElement('button');
                option.type = 'button';
                option.className = 'api-chat-model-option';
                if ((modelInput?.value || '').trim() === modelId) option.classList.add('active');
                option.onclick = (event) => selectApiChatModel(modelId, event);

                const label = document.createElement('span');
                label.innerText = modelId;

                const mark = document.createElement('span');
                mark.className = 'api-chat-model-option-mark';
                mark.innerText = option.classList.contains('active') ? '当前' : '选择';

                option.appendChild(label);
                option.appendChild(mark);
                list.appendChild(option);
            });
        }

        function openApiChatModelPicker(event) {
            if (event) event.stopPropagation();
            if (!apiChatSettingsState.modelOptions.length) return;

            const searchInput = document.getElementById('api-chat-model-search');
            if (searchInput) searchInput.value = '';
            renderApiChatModelOptions();
            toggleModal('api-chat-model-modal', true);
            setTimeout(() => {
                document.getElementById('api-chat-model-search')?.focus();
            }, 60);
        }

        function closeApiChatModelPicker(event) {
            if (event && event.target !== event.currentTarget) return;
            toggleModal('api-chat-model-modal', false);
        }

        function handleApiChatModelInput(event) {
            if (event) event.stopPropagation();
            scheduleApiChatDraftPersist();
        }

        function handleApiChatModelSearchInput(event) {
            if (event) event.stopPropagation();
            renderApiChatModelOptions();
        }

        function selectApiChatModel(modelId, event) {
            if (event) event.stopPropagation();

            const input = document.getElementById('api-chat-model');
            if (!input) return;

            input.value = modelId;
            apiChatSettingsState.model = modelId;
            renderApiChatModelOptions();
            closeApiChatModelPicker();
            scheduleApiChatDraftPersist();
            setApiChatModelStatus(`已选中模型 ${modelId}，当前选择会自动暂存到本地。`, 'success');
        }

        function syncApiChatModelPreview() {
            const previewName = document.getElementById('api-chat-model-preview-name');
            const previewMeta = document.getElementById('api-chat-model-preview-meta');
            if (!previewName || !previewMeta) return;

            const currentModel = document.getElementById('api-chat-model')?.value.trim() || apiChatSettingsState.model || '';
            const total = apiChatSettingsState.modelOptions.length;

            previewName.innerText = currentModel || '尚未选择';
            previewMeta.innerText = currentModel
                ? `已拉取 ${total} 个模型。当前选中的是 ${currentModel}，点击下方列表中的其它模型可直接替换。`
                : `已拉取 ${total} 个模型。请从下方列表中点选一个模型写回设置页。`;
        }

        function populateApiChatForm() {
            const presetInput = document.getElementById('api-chat-preset-name');
            if (!presetInput) return;

            const apiUrlInput = document.getElementById('api-chat-api-url');
            const apiKeyInput = document.getElementById('api-chat-api-key');
            const modelInput = document.getElementById('api-chat-model');
            const temperatureInput = document.getElementById('api-chat-temperature');
            const contextInput = document.getElementById('api-chat-context-count');
            const apiKeyToggleBtn = document.getElementById('api-chat-toggle-key-btn');

            presetInput.value = apiChatSettingsState.presetName || DEFAULT_API_CHAT_SETTINGS.presetName;
            apiUrlInput.value = apiChatSettingsState.apiUrl || '';
            apiKeyInput.value = apiChatSettingsState.apiKey || '';
            modelInput.value = apiChatSettingsState.model || '';
            temperatureInput.value = String(apiChatSettingsState.temperature);
            contextInput.value = String(apiChatSettingsState.contextCount);
            apiKeyInput.type = 'password';
            apiKeyToggleBtn.innerHTML = '<i data-feather="eye"></i>';

            updateApiChatTemperatureValue(apiChatSettingsState.temperature);
            renderApiChatCompatibilityHint(apiChatSettingsState.apiUrl);
            renderApiChatModelOptions();
            closeApiChatModelPicker();

            if (apiChatSettingsState.lastModelSyncAt && apiChatSettingsState.modelOptions.length) {
                const syncTime = formatApiChatTime(apiChatSettingsState.lastModelSyncAt);
                const source = apiChatSettingsState.lastModelSyncSource ? `，来源 ${apiChatSettingsState.lastModelSyncSource}` : '';
                setApiChatModelStatus(`已缓存 ${apiChatSettingsState.modelOptions.length} 个模型${source}${syncTime ? `，同步于 ${syncTime}` : ''}。点这里可重新展开选择框。`, 'success');
            } else {
                setApiChatModelStatus('模型列表拉取失败时仍可手动填写，适配外网、国内与自营兼容接口。');
            }

            if (apiChatDraftUpdatedAt) {
                setApiChatStatus(`当前输入已于 ${formatApiChatTime(apiChatDraftUpdatedAt)} 自动暂存到本地。若要参与数据管理导出或清空，请再点一次保存。`, 'success');
            } else if (apiChatSettingsState.updatedAt) {
                setApiChatStatus(`预设“${apiChatSettingsState.presetName}”已于 ${formatApiChatTime(apiChatSettingsState.updatedAt)} 保存到本地 IndexedDB 轻量持久化。`, 'success');
            } else {
                setApiChatStatus('当前输入会自动暂存到本地；点击保存后会写入本地 IndexedDB 预设，不会自动上传到第三方服务。');
            }

            feather.replace({ 'stroke-width': 1.2 });
        }

        function readApiChatFormState(options = {}) {
            const { normalizeUrl = true } = options;
            const apiUrlField = document.getElementById('api-chat-api-url');
            const contextRaw = document.getElementById('api-chat-context-count')?.value.trim() || '';
            const parsedContext = Number.parseInt(contextRaw, 10);

            return normalizeApiChatSettingsState({
                ...apiChatSettingsState,
                presetName: document.getElementById('api-chat-preset-name')?.value.trim() || DEFAULT_API_CHAT_SETTINGS.presetName,
                apiUrl: normalizeUrl ? normalizeApiBaseUrl(apiUrlField?.value || '') : String(apiUrlField?.value || '').trim(),
                apiKey: document.getElementById('api-chat-api-key')?.value.trim() || '',
                model: document.getElementById('api-chat-model')?.value.trim() || '',
                temperature: document.getElementById('api-chat-temperature')?.value || DEFAULT_API_CHAT_SETTINGS.temperature,
                contextCount: contextRaw === '' || Number.isNaN(parsedContext) ? DEFAULT_API_CHAT_SETTINGS.contextCount : parsedContext
            });
        }

        function persistApiChatDraftState() {
            apiChatSettingsState = readApiChatFormState({ normalizeUrl: false });
            apiChatDraftUpdatedAt = Date.now();
            writeLocalJsonValue(API_CHAT_DRAFT_STORAGE_KEY, {
                ...apiChatSettingsState,
                draftUpdatedAt: apiChatDraftUpdatedAt
            });
        }

        function scheduleApiChatDraftPersist() {
            clearTimeout(apiChatDraftPersistTimer);
            apiChatDraftPersistTimer = setTimeout(() => {
                apiChatDraftPersistTimer = null;
                persistApiChatDraftState();
            }, API_SETTINGS_DRAFT_DEBOUNCE_MS);
        }

        function clearApiChatDraftState() {
            clearTimeout(apiChatDraftPersistTimer);
            apiChatDraftPersistTimer = null;
            apiChatDraftUpdatedAt = 0;
            removeLocalJsonValue(API_CHAT_DRAFT_STORAGE_KEY);
        }

        function handleApiChatDraftInput(event) {
            if (event) event.stopPropagation();
            scheduleApiChatDraftPersist();
        }

        function flashApiChatSaveFeedback() {
            const saveBtn = document.getElementById('api-chat-save-btn');
            const topSaveBtn = document.getElementById('api-chat-top-save-btn');
            if (saveBtn) saveBtn.innerText = '已保存';
            if (topSaveBtn) topSaveBtn.classList.add('active');

            clearTimeout(apiChatSaveFeedbackTimer);
            apiChatSaveFeedbackTimer = setTimeout(() => {
                if (saveBtn) saveBtn.innerText = '保存';
                if (topSaveBtn) topSaveBtn.classList.remove('active');
            }, 1400);
        }

        function buildApiChatModelEndpointCandidates(baseUrl = '') {
            const normalized = normalizeApiBaseUrl(baseUrl);
            if (!normalized) return [];

            const candidates = [];
            const addCandidate = (url) => {
                if (url && !candidates.includes(url)) candidates.push(url);
            };

            const cleanBase = normalized.replace(/\/+$/, '');
            const versionlessBase = cleanBase.replace(/\/v\d+(?:beta)?$/i, '');

            addCandidate(`${cleanBase}/models`);
            if (!/\/v\d+(?:beta)?$/i.test(cleanBase)) addCandidate(`${cleanBase}/v1/models`);
            addCandidate(`${cleanBase}/api/tags`);

            if (versionlessBase && versionlessBase !== cleanBase) {
                addCandidate(`${versionlessBase}/models`);
                addCandidate(`${versionlessBase}/api/tags`);
            }

            return candidates;
        }

        function buildApiChatAuthVariants(apiKey = '') {
            const key = String(apiKey || '').trim();
            const baseHeaders = { Accept: 'application/json' };
            if (!key) return [{ headers: baseHeaders, label: '匿名' }];

            return [
                { headers: { ...baseHeaders, Authorization: `Bearer ${key}` }, label: 'Bearer' },
                { headers: { ...baseHeaders, 'X-API-Key': key }, label: 'X-API-Key' },
                { headers: { ...baseHeaders, 'api-key': key }, label: 'api-key' },
                { headers: baseHeaders, label: '匿名' }
            ];
        }

        function extractModelIdsFromResponse(payload) {
            const candidateLists = [];
            if (Array.isArray(payload)) candidateLists.push(payload);

            if (payload && typeof payload === 'object') {
                ['data', 'models', 'items', 'results'].forEach(key => {
                    if (Array.isArray(payload[key])) candidateLists.push(payload[key]);
                });

                if (payload.data && typeof payload.data === 'object' && !Array.isArray(payload.data)) {
                    ['models', 'items', 'results'].forEach(key => {
                        if (Array.isArray(payload.data[key])) candidateLists.push(payload.data[key]);
                    });
                }
            }

            const modelIds = [];
            candidateLists.forEach(list => {
                list.forEach(item => {
                    if (typeof item === 'string') {
                        const value = item.trim();
                        if (value) modelIds.push(value);
                        return;
                    }

                    if (!item || typeof item !== 'object') return;

                    const value = item.id || item.name || item.model || item.slug;
                    if (value) modelIds.push(String(value).trim());
                });
            });

            return [...new Set(modelIds.filter(Boolean))];
        }

        function getApiChatPullFailureMessage(lastError = '') {
            const baseMessage = lastError || '未能从该接口拉取模型列表。';
            if (window.location.protocol === 'file:') {
                return `${baseMessage} 如果目标服务限制 null origin，请将页面放到本地 HTTP 服务下再试。`;
            }
            return `${baseMessage} 请检查接口基址、密钥、模型列表路径和 CORS 配置。`;
        }

        function handleApiChatUrlInput(event) {
            if (event) event.stopPropagation();
            const currentValue = document.getElementById('api-chat-api-url')?.value || '';
            renderApiChatCompatibilityHint(currentValue);
            scheduleApiChatDraftPersist();
        }

        function handleApiChatTemperatureInput(event) {
            if (event) event.stopPropagation();
            updateApiChatTemperatureValue(document.getElementById('api-chat-temperature')?.value);
            scheduleApiChatDraftPersist();
        }

        function setApiVoiceStatus(message, tone = 'default') {
            const element = document.getElementById('api-voice-status');
            if (!element) return;
            element.innerText = message;
            if (tone === 'default') delete element.dataset.tone;
            else element.dataset.tone = tone;
        }

        function setApiVoiceEditionSelection(edition, event = null) {
            if (event) event.stopPropagation();

            const normalizedEdition = ['domestic', 'overseas'].includes(edition) ? edition : DEFAULT_API_VOICE_SETTINGS.edition;
            document.querySelectorAll('.api-voice-option').forEach(option => {
                option.classList.toggle('active', option.dataset.value === normalizedEdition);
            });
            apiVoiceSettingsState.edition = normalizedEdition;
            if (event) scheduleApiVoiceDraftPersist();
        }

        function getSelectedApiVoiceEdition() {
            return document.querySelector('.api-voice-option.active')?.dataset.value || apiVoiceSettingsState.edition || DEFAULT_API_VOICE_SETTINGS.edition;
        }

        function updateApiVoiceSpeedValue(value) {
            const output = document.getElementById('api-voice-speed-value');
            if (!output) return;
            const numericValue = Number.parseFloat(value);
            output.innerText = Number.isFinite(numericValue) ? numericValue.toFixed(1) : DEFAULT_API_VOICE_SETTINGS.speed.toFixed(1);
        }

        function handleApiVoiceSpeedInput(event) {
            if (event) event.stopPropagation();
            updateApiVoiceSpeedValue(document.getElementById('api-voice-speed')?.value);
            scheduleApiVoiceDraftPersist();
        }

        function toggleApiChatKeyVisibility(event) {
            if (event) event.stopPropagation();

            const keyInput = document.getElementById('api-chat-api-key');
            const toggleBtn = document.getElementById('api-chat-toggle-key-btn');
            if (!keyInput || !toggleBtn) return;

            const shouldReveal = keyInput.type === 'password';
            keyInput.type = shouldReveal ? 'text' : 'password';
            toggleBtn.innerHTML = `<i data-feather="${shouldReveal ? 'eye-off' : 'eye'}"></i>`;
            feather.replace({ 'stroke-width': 1.2 });
        }

        function toggleApiVoiceKeyVisibility(event) {
            if (event) event.stopPropagation();

            const keyInput = document.getElementById('api-voice-api-key');
            const toggleBtn = document.getElementById('api-voice-toggle-key-btn');
            if (!keyInput || !toggleBtn) return;

            const shouldReveal = keyInput.type === 'password';
            keyInput.type = shouldReveal ? 'text' : 'password';
            toggleBtn.innerHTML = `<i data-feather="${shouldReveal ? 'eye-off' : 'eye'}"></i>`;
            feather.replace({ 'stroke-width': 1.2 });
        }

        function populateApiVoiceForm() {
            const presetInput = document.getElementById('api-voice-preset-name');
            if (!presetInput) return;

            const apiKeyInput = document.getElementById('api-voice-api-key');
            const groupIdInput = document.getElementById('api-voice-group-id');
            const speedInput = document.getElementById('api-voice-speed');
            const languageInput = document.getElementById('api-voice-language');
            const apiKeyToggleBtn = document.getElementById('api-voice-toggle-key-btn');

            presetInput.value = apiVoiceSettingsState.presetName || DEFAULT_API_VOICE_SETTINGS.presetName;
            apiKeyInput.value = apiVoiceSettingsState.apiKey || '';
            groupIdInput.value = apiVoiceSettingsState.groupId || '';
            speedInput.value = String(apiVoiceSettingsState.speed);
            languageInput.value = apiVoiceSettingsState.language || DEFAULT_API_VOICE_SETTINGS.language;
            apiKeyInput.type = 'password';
            apiKeyToggleBtn.innerHTML = '<i data-feather="eye"></i>';

            setApiVoiceEditionSelection(apiVoiceSettingsState.edition);
            updateApiVoiceSpeedValue(apiVoiceSettingsState.speed);

            if (apiVoiceDraftUpdatedAt) {
                setApiVoiceStatus(`当前输入已于 ${formatApiChatTime(apiVoiceDraftUpdatedAt)} 自动暂存到本地。若要参与数据管理导出或清空，请再点一次保存。`, 'success');
            } else if (apiVoiceSettingsState.updatedAt) {
                setApiVoiceStatus(`预设“${apiVoiceSettingsState.presetName}”已于 ${formatApiChatTime(apiVoiceSettingsState.updatedAt)} 保存到本地 IndexedDB 轻量持久化。`, 'success');
            } else {
                setApiVoiceStatus('当前输入会自动暂存到本地；点击保存后会写入本地 IndexedDB 预设，不会自动上传到第三方服务。');
            }

            feather.replace({ 'stroke-width': 1.2 });
        }

        function readApiVoiceFormState() {
            return normalizeApiVoiceSettingsState({
                ...apiVoiceSettingsState,
                presetName: document.getElementById('api-voice-preset-name')?.value.trim() || DEFAULT_API_VOICE_SETTINGS.presetName,
                edition: getSelectedApiVoiceEdition(),
                apiKey: document.getElementById('api-voice-api-key')?.value.trim() || '',
                groupId: document.getElementById('api-voice-group-id')?.value.trim() || '',
                speed: document.getElementById('api-voice-speed')?.value || DEFAULT_API_VOICE_SETTINGS.speed,
                language: document.getElementById('api-voice-language')?.value.trim() || DEFAULT_API_VOICE_SETTINGS.language
            });
        }

        function persistApiVoiceDraftState() {
            apiVoiceSettingsState = readApiVoiceFormState();
            apiVoiceDraftUpdatedAt = Date.now();
            writeLocalJsonValue(API_VOICE_DRAFT_STORAGE_KEY, {
                ...apiVoiceSettingsState,
                draftUpdatedAt: apiVoiceDraftUpdatedAt
            });
        }

        function scheduleApiVoiceDraftPersist() {
            clearTimeout(apiVoiceDraftPersistTimer);
            apiVoiceDraftPersistTimer = setTimeout(() => {
                apiVoiceDraftPersistTimer = null;
                persistApiVoiceDraftState();
            }, API_SETTINGS_DRAFT_DEBOUNCE_MS);
        }

        function clearApiVoiceDraftState() {
            clearTimeout(apiVoiceDraftPersistTimer);
            apiVoiceDraftPersistTimer = null;
            apiVoiceDraftUpdatedAt = 0;
            removeLocalJsonValue(API_VOICE_DRAFT_STORAGE_KEY);
        }

        function handleApiVoiceDraftInput(event) {
            if (event) event.stopPropagation();
            scheduleApiVoiceDraftPersist();
        }

        function flashApiVoiceSaveFeedback() {
            const saveBtn = document.getElementById('api-voice-save-btn');
            const topSaveBtn = document.getElementById('api-voice-top-save-btn');
            if (saveBtn) saveBtn.innerText = '已保存';
            if (topSaveBtn) topSaveBtn.classList.add('active');

            clearTimeout(apiVoiceSaveFeedbackTimer);
            apiVoiceSaveFeedbackTimer = setTimeout(() => {
                if (saveBtn) saveBtn.innerText = '保存';
                if (topSaveBtn) topSaveBtn.classList.remove('active');
            }, 1400);
        }

        async function saveApiChatSettings(event) {
            if (event) event.stopPropagation();

            const rawApiUrl = document.getElementById('api-chat-api-url')?.value.trim() || '';
            const normalizedApiUrl = normalizeApiBaseUrl(rawApiUrl);

            if (rawApiUrl && !normalizedApiUrl) {
                setApiChatStatus('接口网址格式无效，请检查后再保存。', 'error');
                document.getElementById('api-chat-api-url')?.focus();
                return;
            }

            apiChatSettingsState = {
                ...readApiChatFormState(),
                modelOptions: [...apiChatSettingsState.modelOptions],
                lastModelSyncAt: apiChatSettingsState.lastModelSyncAt,
                lastModelSyncSource: apiChatSettingsState.lastModelSyncSource
            };

            await persistApiChatSettingsState();
            clearApiChatDraftState();
            populateApiChatForm();
            flashApiChatSaveFeedback();
            setApiChatStatus(`预设“${apiChatSettingsState.presetName}”已保存到本地 IndexedDB 轻量持久化。`, 'success');
            void refreshDataManagementPanel();
        }

        async function saveApiVoiceSettings(event) {
            if (event) event.stopPropagation();

            apiVoiceSettingsState = readApiVoiceFormState();

            await persistApiVoiceSettingsState();
            clearApiVoiceDraftState();
            populateApiVoiceForm();
            flashApiVoiceSaveFeedback();
            setApiVoiceStatus(`预设“${apiVoiceSettingsState.presetName}”已保存到本地 IndexedDB 轻量持久化。`, 'success');
            void refreshDataManagementPanel();
        }

        async function deleteApiChatSettings(event) {
            if (event) event.stopPropagation();
            if (!confirm('确认删除当前 API 聊天预设吗？已保存的接口地址、密钥和模型配置都会被清空。')) return;

            await appDB.deleteApiChatSettings();
            clearApiChatDraftState();
            apiChatSettingsState = { ...DEFAULT_API_CHAT_SETTINGS };
            populateApiChatForm();
            setApiChatStatus('API 聊天预设已删除，界面已恢复为默认状态。', 'success');
            void refreshDataManagementPanel();
        }

        async function deleteApiVoiceSettings(event) {
            if (event) event.stopPropagation();
            if (!confirm('确认删除当前 API 语音预设吗？已保存的版本、密钥、Group id、语速和语言配置都会被清空。')) return;

            await appDB.deleteApiVoiceSettings();
            clearApiVoiceDraftState();
            apiVoiceSettingsState = { ...DEFAULT_API_VOICE_SETTINGS };
            populateApiVoiceForm();
            setApiVoiceStatus('API 语音预设已删除，界面已恢复为默认状态。', 'success');
            void refreshDataManagementPanel();
        }

        async function pullApiChatModels(event) {
            if (event) event.stopPropagation();
            if (apiChatModelPullInFlight) return;

            const draftState = readApiChatFormState();
            if (!draftState.apiUrl) {
                setApiChatStatus('请先填写 API 接口网址，再拉取模型列表。', 'error');
                document.getElementById('api-chat-api-url')?.focus();
                return;
            }

            const pullButton = document.getElementById('api-chat-pull-models-btn');
            const endpointCandidates = buildApiChatModelEndpointCandidates(draftState.apiUrl);
            const authVariants = buildApiChatAuthVariants(draftState.apiKey);
            let lastError = '';

            apiChatModelPullInFlight = true;
            if (pullButton) {
                pullButton.disabled = true;
                pullButton.innerText = '拉取中';
            }
            setApiChatStatus('正在尝试兼容外网 API、国内 API 与自营 API 的模型列表接口。', 'working');
            setApiChatModelStatus('正在依次尝试 `/models`、`/v1/models` 与部分自营服务的 `/api/tags`。', 'working');

            try {
                for (const endpoint of endpointCandidates) {
                    for (const authVariant of authVariants) {
                        try {
                            const response = await fetch(endpoint, {
                                method: 'GET',
                                headers: authVariant.headers,
                                redirect: 'follow'
                            });

                            if (!response.ok) {
                                lastError = `${response.status} ${response.statusText}`.trim();
                                continue;
                            }

                            const payload = await response.json();
                            const modelIds = extractModelIdsFromResponse(payload);
                            if (!modelIds.length) {
                                lastError = '接口已返回成功响应，但未解析出模型列表';
                                continue;
                            }

                            const preservedModel = modelIds.includes(draftState.model)
                                ? draftState.model
                                : (modelIds.length === 1 ? modelIds[0] : '');

                            apiChatSettingsState = normalizeApiChatSettingsState({
                                ...apiChatSettingsState,
                                ...draftState,
                                model: preservedModel,
                                modelOptions: modelIds,
                                lastModelSyncAt: Date.now(),
                                lastModelSyncSource: endpoint
                            });

                            populateApiChatForm();
                            persistApiChatDraftState();
                            setApiChatModelStatus(`已拉取 ${modelIds.length} 个模型，当前来源 ${endpoint}。点击这里可打开选择框。`, 'success');
                            setApiChatStatus(`模型列表拉取成功，已兼容识别 ${detectApiChatProviderKind(draftState.apiUrl)}。选择框改为点击后再显示。`, 'success');
                            return;
                        } catch (error) {
                            lastError = error?.message || '网络请求失败';
                        }
                    }
                }

                setApiChatModelStatus(getApiChatPullFailureMessage(lastError), 'error');
                setApiChatStatus('模型列表拉取失败，当前仍可手动填写模型名称。', 'warning');
            } finally {
                apiChatModelPullInFlight = false;
                if (pullButton) {
                    pullButton.disabled = false;
                    pullButton.innerText = '拉取';
                }
            }
        }

        function populateProfileFormFields(fieldIds) {
            Object.entries(fieldIds).forEach(([key, id]) => {
                const field = document.getElementById(id);
                if (field) field.value = forumProfileState[key] || '';
            });
        }

        function readProfileFormFields(fieldIds) {
            const nextState = {};
            Object.entries(fieldIds).forEach(([key, id]) => {
                const field = document.getElementById(id);
                nextState[key] = field ? field.value.trim() : '';
            });
            return nextState;
        }

        function populateForumProfileForm() {
            populateProfileFormFields(FORUM_PROFILE_FORM_IDS);
        }

        function populateChatProfileForm() {
            populateProfileFormFields(CHAT_PROFILE_FORM_IDS);
        }

        function flashProfileSaveButton(buttonId) {
            const saveBtn = document.getElementById(buttonId);
            if (!saveBtn) return;
            ['profile-save-btn', 'chat-profile-save-btn'].forEach(id => {
                const button = document.getElementById(id);
                if (button) button.innerText = '保存资料';
            });
            saveBtn.innerText = '已保存';
            clearTimeout(profileSaveFeedbackTimer);
            profileSaveFeedbackTimer = setTimeout(() => {
                saveBtn.innerText = '保存资料';
            }, 1400);
        }

        function applyForumProfileUI() {
            const displayName = forumProfileState.name || DEFAULT_FORUM_PROFILE.name;
            const displayId = forumProfileState.profileId || DEFAULT_FORUM_PROFILE.profileId;
            const displayBio = forumProfileState.bio || '还没有填写简介，点这里就可以补充签名与近况。';
            const displayLocation = forumProfileState.location || '未设置';
            const displayEmail = forumProfileState.email || '未填写';
            const displayWebsite = forumProfileState.website || '未填写';

            document.querySelector('.profile-name').innerText = displayName;
            document.querySelector('.profile-id').innerText = `ID: ${displayId}`;
            const forumProfileSummaryId = document.getElementById('forum-profile-summary-id');
            const forumProfileBio = document.getElementById('forum-profile-bio');
            const forumProfileLocation = document.getElementById('forum-profile-location');
            const forumProfileEmail = document.getElementById('forum-profile-email');
            const forumProfileWebsite = document.getElementById('forum-profile-website');
            if (forumProfileSummaryId) forumProfileSummaryId.innerText = `ID: ${displayId}`;
            if (forumProfileBio) forumProfileBio.innerText = displayBio;
            if (forumProfileLocation) forumProfileLocation.innerText = displayLocation;
            if (forumProfileEmail) forumProfileEmail.innerText = displayEmail;
            if (forumProfileWebsite) forumProfileWebsite.innerText = displayWebsite;

            const avatarFallback = '<i data-feather="user" width="50" height="50"></i>';
            setBackgroundFilePreview(document.querySelector('.profile-avatar-new'), forumProfileState.avatarFile, avatarFallback);
            setBackgroundFilePreview(document.querySelector('.profile-bg-new'), forumProfileState.backgroundFile, '');

            document.querySelectorAll('.forum-user-avatar').forEach(avatar => {
                setBackgroundFilePreview(avatar, forumProfileState.avatarFile, '<i data-feather="user" width="18" height="18"></i>');
            });
            document.querySelectorAll('.forum-profile-name-output').forEach(element => {
                element.innerText = displayName;
            });

            setBackgroundFilePreview(document.getElementById('chat-thread-avatar-self'), forumProfileState.avatarFile, '<i data-feather="user"></i>');
            setBackgroundFilePreview(document.getElementById('chat-moment-avatar'), forumProfileState.avatarFile, '<i data-feather="user"></i>');
            setBackgroundFilePreview(document.getElementById('chat-profile-avatar'), forumProfileState.avatarFile, '<i data-feather="user"></i>');
            setBackgroundFilePreview(document.getElementById('chat-stack-avatar-primary'), forumProfileState.avatarFile, '<i data-feather="user" width="18" height="18"></i>');
            document.getElementById('chat-profile-name').innerText = displayName;
            document.getElementById('chat-profile-id').innerText = `ID / ${displayId}`;
            document.getElementById('chat-profile-note-text').innerText = displayBio;
            document.getElementById('chat-profile-bio').innerText = displayBio;
            document.getElementById('chat-profile-location').innerText = displayLocation;
            document.getElementById('chat-profile-email').innerText = displayEmail;
            document.getElementById('chat-profile-website').innerText = displayWebsite;

            feather.replace({ 'stroke-width': 1.2 });
        }

        function openForumAvatarPicker() {
            const input = document.getElementById('forum-avatar-input');
            input.value = '';
            input.click();
        }

        function openForumBackgroundPicker() {
            const input = document.getElementById('forum-bg-input');
            input.value = '';
            input.click();
        }

        function openChatProfileEditor(focusField = '') {
            populateChatProfileForm();
            toggleModal('profile-editor-modal', true);
            if (focusField) {
                const field = document.getElementById(CHAT_PROFILE_FORM_IDS[focusField]);
                if (field) {
                    setTimeout(() => {
                        field.focus();
                        if (typeof field.select === 'function') field.select();
                    }, 60);
                }
            }
        }

        function closeChatProfileEditor(event) {
            if (event && event.target !== event.currentTarget) return;
            toggleModal('profile-editor-modal', false);
        }

        async function handleForumImageSelect(event, type) {
            const file = event.target.files[0];
            if (!file) return;

            if (type === 'avatar') {
                forumProfileState.avatarFile = file;
            } else if (type === 'background') {
                forumProfileState.backgroundFile = file;
            }

            await persistForumProfileState();
            applyForumProfileUI();
            event.target.value = '';
        }

        let currentChatTab = 'threads';
        let chatRoleThreads = [];
        let currentChatRoleThreadId = null;
        let currentChatRoleConfigState = {
            threadId: null,
            archiveId: null,
            identityProfileId: null,
            worldbookIds: []
        };
        let chatRoleRequestInFlight = false;

        function normalizeChatRoleMessages(messages = []) {
            if (!Array.isArray(messages)) return [];

            return messages
                .map((message, index) => {
                    const text = String(message?.text || '').trim();
                    if (!text) return null;

                    const role = message?.role === 'user' ? 'user' : 'assistant';
                    const createdAt = Number(message?.createdAt) || (Date.now() + index);

                    return {
                        id: message?.id || `${role}-${createdAt}-${index}`,
                        role,
                        text,
                        createdAt
                    };
                })
                .filter(Boolean);
        }

        function normalizeChatRoleThreads(threads = []) {
            if (!Array.isArray(threads)) return [];

            return threads
                .map((thread, index) => {
                    const updatedAt = Number(thread?.updatedAt) || (Date.now() + index);
                    const createdAt = Number(thread?.createdAt) || updatedAt;

                    return {
                        id: Number(thread?.id) || (updatedAt + index),
                        archiveId: Number.isFinite(Number(thread?.archiveId)) ? Number(thread.archiveId) : null,
                        name: String(thread?.name || '未命名角色').trim() || '未命名角色',
                        type: String(thread?.type || 'char').trim() || 'char',
                        summary: String(thread?.summary || '').trim(),
                        imageFile: thread?.imageFile instanceof Blob ? thread.imageFile : null,
                        createdAt,
                        updatedAt,
                        messages: normalizeChatRoleMessages(thread?.messages)
                    };
                })
                .sort((a, b) => b.updatedAt - a.updatedAt);
        }

        function buildChatRoleSummary(content = '', maxLength = 52) {
            const normalized = String(content || '').replace(/\s+/g, ' ').trim();
            if (!normalized) return '';
            return normalized.length <= maxLength ? normalized : `${normalized.slice(0, maxLength).trimEnd()}...`;
        }

        function arePreviewFilesEquivalent(left, right) {
            if (left === right) return true;
            if (!(left instanceof Blob) || !(right instanceof Blob)) return !left && !right;

            return left.size === right.size
                && left.type === right.type
                && String(left.name || '') === String(right.name || '')
                && Number(left.lastModified || 0) === Number(right.lastModified || 0);
        }

        function formatChatRoleTime(timestamp, includeDate = false) {
            if (!timestamp) return '刚刚';

            const date = new Date(timestamp);
            const now = new Date();
            const hours = `${date.getHours()}`.padStart(2, '0');
            const minutes = `${date.getMinutes()}`.padStart(2, '0');
            const month = `${date.getMonth() + 1}`.padStart(2, '0');
            const day = `${date.getDate()}`.padStart(2, '0');

            if (includeDate) {
                return `${month}/${day} ${hours}:${minutes}`;
            }

            if (!includeDate && date.toDateString() === now.toDateString()) {
                return `${hours}:${minutes}`;
            }

            return `${month}/${day}`;
        }

        function getChatRoleThreadPreview(thread) {
            const lastMessage = thread?.messages?.[thread.messages.length - 1];
            return buildChatRoleSummary(
                lastMessage?.text || thread?.summary || '已加入消息页，点击继续聊天。',
                46
            ) || '已加入消息页，点击继续聊天。';
        }

        function createChatRoleSeedMessage(entry) {
            const name = String(entry?.name || '未命名角色').trim() || '未命名角色';
            const summary = buildChatRoleSummary(entry?.content || '', 44);

            return summary
                ? `已把 ${name} 加入消息页。当前档案重点：${summary}。现在可以直接开始本地角色聊天。`
                : `已把 ${name} 加入消息页。现在可以直接开始本地角色聊天。`;
        }

        function createChatRoleAutoReply(thread, userText) {
            const name = String(thread?.name || '角色').trim() || '角色';
            const summary = buildChatRoleSummary(thread?.summary || '', 50);
            const focus = buildChatRoleSummary(userText, 40) || '这段内容';
            const variants = [
                `${name} 已收到你的内容。${summary ? `档案里当前最突出的设定是：${summary}。` : '现在还没有更细的角色设定。'}你刚才提到“${focus}”，可以继续补场景、关系或语气，我会沿着这张档案卡继续接。`,
                `这是本地档案角色会话，不调用外部 API。${summary ? `${name} 会优先围绕「${summary}」回应。` : `${name} 会按你保存的档案内容继续。`}你也可以直接输入开场白或动作描述。`,
                `${name} 先接住这句：“${focus}”。${summary ? `如果继续往下聊，我会把角色重点放在 ${summary}。` : '如果你想让角色更稳定，可以先去档案页补充设定。'}`
            ];

            return variants[(thread.messages.length + userText.length) % variants.length];
        }

        function syncChatRoleThreadsWithArchiveProfiles() {
            if (!chatRoleThreads.length || !archiveProfiles.length) return false;

            const archiveMap = new Map(archiveProfiles.map(entry => [entry.id, entry]));
            let changed = false;

            chatRoleThreads = chatRoleThreads
                .map(thread => {
                    const archiveEntry = archiveMap.get(thread.archiveId);
                    if (!archiveEntry) return thread;

                    const nextThread = {
                        ...thread,
                        name: String(archiveEntry.name || thread.name || '未命名角色').trim() || '未命名角色',
                        type: String(archiveEntry.type || thread.type || 'char').trim() || 'char',
                        summary: String(archiveEntry.content || thread.summary || '').trim(),
                        imageFile: archiveEntry.imageFile || null
                    };

                    if (
                        nextThread.name !== thread.name
                        || nextThread.type !== thread.type
                        || nextThread.summary !== thread.summary
                        || !arePreviewFilesEquivalent(nextThread.imageFile, thread.imageFile)
                    ) {
                        changed = true;
                    }

                    return nextThread;
                })
                .sort((a, b) => b.updatedAt - a.updatedAt);

            return changed;
        }

        async function initChatRoleThreadsData() {
            const savedThreads = await appDB.getChatRoleThreads();
            chatRoleThreads = normalizeChatRoleThreads(savedThreads?.threads);

            const chatThreadsChanged = syncChatRoleThreadsWithArchiveProfiles();
            currentChatRoleThreadId = chatRoleThreads.some(thread => thread.id === currentChatRoleThreadId)
                ? currentChatRoleThreadId
                : (chatRoleThreads[0]?.id || null);

            renderChatRoleThreadList();
            renderChatRolePickerList();

            if (chatThreadsChanged) await persistChatRoleThreads();
        }

        async function persistChatRoleThreads() {
            chatRoleThreads.sort((a, b) => b.updatedAt - a.updatedAt);
            await appDB.saveChatRoleThreads({
                threads: chatRoleThreads,
                updatedAt: Date.now()
            });
        }

        function openChatRolePicker() {
            renderChatRolePickerList();
            toggleModal('chat-role-picker-modal', true);
        }

        function closeChatRolePicker(event) {
            if (event && event.target !== event.currentTarget) return;
            toggleModal('chat-role-picker-modal', false);
        }

        function renderChatRolePickerList() {
            const container = document.getElementById('chat-role-picker-list');
            if (!container) return;

            if (!archiveProfiles.length) {
                container.innerHTML = '<div class="chat-role-picker-empty">还没有档案角色。先去档案页创建一张角色卡，再回这里加入消息页。</div>';
                return;
            }

            container.innerHTML = '';
            archiveProfiles.forEach(entry => {
                const existingThread = chatRoleThreads.find(thread => thread.archiveId === entry.id);
                const typeLabel = getArchiveTypeLabel(entry.type);
                const card = document.createElement('div');
                card.className = 'chat-role-picker-card';
                card.innerHTML = `
                    <div class="chat-role-picker-avatar"></div>
                    <div class="chat-role-picker-main">
                        <div class="chat-role-picker-name">${escapeHtml(entry.name || '未命名角色')}</div>
                        <div class="chat-role-picker-meta">
                            <span>${escapeHtml(typeLabel)}</span>
                            <span>${existingThread ? '已在消息页' : '尚未加入'}</span>
                        </div>
                        <div class="chat-role-picker-desc">${escapeHtml(buildChatRoleSummary(entry.content || '', 56) || '这张档案还没有填写详细设定。')}</div>
                    </div>
                    <button class="chat-role-picker-btn ${existingThread ? 'active' : ''}" type="button">${existingThread ? '打开' : '加入'}</button>
                `;

                setBackgroundFilePreview(
                    card.querySelector('.chat-role-picker-avatar'),
                    entry.imageFile,
                    `<span class="chat-role-picker-avatar-label">${escapeHtml(typeLabel)}</span>`
                );

                card.addEventListener('click', () => {
                    if (existingThread) {
                        openChatRoleThreadByArchiveId(entry.id);
                    } else {
                        void addArchiveProfileToChat(entry.id);
                    }
                });

                card.querySelector('.chat-role-picker-btn').addEventListener('click', event => {
                    event.stopPropagation();
                    if (existingThread) {
                        openChatRoleThreadByArchiveId(entry.id);
                    } else {
                        void addArchiveProfileToChat(entry.id);
                    }
                });

                container.appendChild(card);
            });
        }

        async function addArchiveProfileToChat(id) {
            const entry = archiveProfiles.find(item => item.id === id);
            if (!entry) return;

            const existingThread = chatRoleThreads.find(thread => thread.archiveId === id);
            if (existingThread) {
                closeChatRolePicker(null);
                openChatRoleThread(existingThread.id);
                return;
            }

            const now = Date.now();
            const thread = {
                id: now,
                archiveId: entry.id,
                name: String(entry.name || '未命名角色').trim() || '未命名角色',
                type: String(entry.type || 'char').trim() || 'char',
                summary: String(entry.content || '').trim(),
                imageFile: entry.imageFile || null,
                createdAt: now,
                updatedAt: now,
                messages: [{
                    id: `assistant-${now}`,
                    role: 'assistant',
                    text: createChatRoleSeedMessage(entry),
                    createdAt: now
                }]
            };

            chatRoleThreads.unshift(thread);
            currentChatRoleThreadId = thread.id;

            await persistChatRoleThreads();
            renderChatRoleThreadList();
            renderChatRolePickerList();
            closeChatRolePicker(null);
            openChatRoleThread(thread.id);
        }

        function openChatRoleThreadByArchiveId(archiveId) {
            const thread = chatRoleThreads.find(item => item.archiveId === archiveId);
            if (!thread) return;

            closeChatRolePicker(null);
            openChatRoleThread(thread.id);
        }

        function renderChatRoleThreadList() {
            const container = document.getElementById('chat-role-thread-list');
            if (!container) return;

            if (!chatRoleThreads.length) {
                container.innerHTML = '<div class="chat-role-empty">还没有角色会话。点右侧 + 把档案角色加入消息页，就能直接开始本地聊天。</div>';
                return;
            }

            container.innerHTML = '';
            chatRoleThreads
                .sort((a, b) => b.updatedAt - a.updatedAt)
                .forEach(thread => {
                    const typeLabel = getArchiveTypeLabel(thread.type);
                    const card = document.createElement('div');
                    card.className = 'chat-thread chat-thread-role';
                    card.innerHTML = `
                        <div class="chat-thread-avatar chat-role-thread-avatar"></div>
                        <div class="chat-thread-main">
                            <div class="chat-thread-name-row">
                                <div class="chat-thread-name">${escapeHtml(thread.name)}</div>
                                <div class="chat-thread-tag">${escapeHtml(typeLabel)}</div>
                            </div>
                            <div class="chat-thread-snippet">${escapeHtml(getChatRoleThreadPreview(thread))}</div>
                        </div>
                        <div class="chat-thread-meta">
                            <span>${escapeHtml(formatChatRoleTime(thread.updatedAt))}</span>
                            <div class="chat-thread-badge">${thread.messages.length}</div>
                        </div>
                    `;

                    setBackgroundFilePreview(
                        card.querySelector('.chat-role-thread-avatar'),
                        thread.imageFile,
                        `<span class="chat-thread-role-avatar-label">${escapeHtml(typeLabel)}</span>`
                    );

                    card.addEventListener('click', () => openChatRoleThread(thread.id));
                    container.appendChild(card);
                });

            feather.replace({ 'stroke-width': 1.2 });
        }

        function openChatRoleThread(threadId) {
            const thread = chatRoleThreads.find(item => item.id === threadId);
            if (!thread) return;

            currentChatRoleThreadId = thread.id;
            document.getElementById('chat-role-thread-title').innerText = thread.name;
            document.getElementById('chat-role-thread-subtitle').innerText = `${getArchiveTypeLabel(thread.type)} 档案角色聊天`;
            setBackgroundFilePreview(
                document.getElementById('chat-role-thread-avatar'),
                thread.imageFile,
                `<span class="chat-thread-role-avatar-label">${escapeHtml(getArchiveTypeLabel(thread.type))}</span>`
            );

            renderChatRoleThreadMessages();
            toggleModal('chat-role-thread-modal', true);
            setTimeout(() => {
                const input = document.getElementById('chat-role-thread-input');
                if (input) input.focus();
            }, 80);
        }

        function closeChatRoleThread(event) {
            if (event && event.target !== event.currentTarget) return;
            toggleModal('chat-role-thread-modal', false);
        }

        function renderChatRoleThreadMessages() {
            const container = document.getElementById('chat-role-thread-messages');
            if (!container) return;

            const thread = chatRoleThreads.find(item => item.id === currentChatRoleThreadId);
            if (!thread || !thread.messages.length) {
                container.innerHTML = '<div class="chat-role-thread-empty">这里还没有消息。输入一句话，开始和档案角色继续对话。</div>';
                return;
            }

            container.innerHTML = '';
            thread.messages.forEach(message => {
                const item = document.createElement('div');
                item.className = `chat-role-message ${message.role === 'user' ? 'user' : 'assistant'}`;
                item.innerHTML = `
                    <div class="chat-role-bubble">${escapeHtml(message.text).replace(/\n/g, '<br>')}</div>
                    <div class="chat-role-bubble-meta">${escapeHtml(formatChatRoleTime(message.createdAt, true))}</div>
                `;
                container.appendChild(item);
            });

            container.scrollTop = container.scrollHeight;
        }

        function buildApiChatCompletionEndpointCandidates(baseUrl = '') {
            const normalized = normalizeApiBaseUrl(baseUrl);
            if (!normalized) return [];

            const candidates = [];
            const addCandidate = url => {
                if (url && !candidates.includes(url)) candidates.push(url);
            };

            const cleanBase = normalized.replace(/\/+$/, '');
            const versionlessBase = cleanBase.replace(/\/v\d+(?:beta)?$/i, '');

            addCandidate(`${cleanBase}/chat/completions`);
            if (!/\/v\d+(?:beta)?$/i.test(cleanBase)) addCandidate(`${cleanBase}/v1/chat/completions`);
            addCandidate(`${cleanBase}/api/chat`);

            if (versionlessBase && versionlessBase !== cleanBase) {
                addCandidate(`${versionlessBase}/chat/completions`);
                addCandidate(`${versionlessBase}/v1/chat/completions`);
                addCandidate(`${versionlessBase}/api/chat`);
            }

            return candidates;
        }

        function getChatRoleHistoryMessages(thread, contextCount) {
            const limit = Math.max(0, Number.parseInt(contextCount, 10) || 0);
            if (!limit) return [];

            return thread.messages
                .slice(-limit)
                .map(message => ({
                    role: message.role === 'user' ? 'user' : 'assistant',
                    content: getChatRoleMessageRawContent(message)
                }))
                .filter(item => String(item.content || '').trim());
        }

        function formatWorldbookEntriesForPrompt(entries = []) {
            if (!entries.length) return '无';

            return entries.map((entry, index) => {
                const keywords = Array.isArray(entry.keywords) && entry.keywords.length
                    ? `；关键词：${entry.keywords.join('、')}`
                    : '';
                return [
                    `${index + 1}. 标题：${entry.title || '未命名条目'}`,
                    `范围：${getWorldbookScopeLabel(entry.scope)}；生效：${getWorldbookTriggerLabel(entry.triggerMode)}；注入：${getWorldbookInjectLabel(entry.injectPosition)}${keywords}`,
                    `内容：${entry.content || '无'}`
                ].join('\n');
            }).join('\n\n');
        }

        function buildChatRolePromptBundle(thread, settings, carriedContextCount) {
            const worldbooks = getChatRoleThreadWorldbooks(thread);
            const safeTemperature = Number(settings.temperature).toFixed(1);
            const safeContextCount = Math.max(0, Number.parseInt(settings.contextCount, 10) || 0);
            const roleSummary = thread.summary || '未补充角色设定。';
            const identitySummary = thread.identitySummary || '未补充用户身份牌设定。';
            const worldbookText = formatWorldbookEntriesForPrompt(worldbooks);

            return {
                systemPrompt: [
                    `你现在只扮演「${thread.name}」，并且只能站在这个角色的立场继续对话。`,
                    '目标是让这段互动像活人、像当事人、像当前关系链里的真实往来：语气、情绪、停顿、欲望、顾虑和反应都要自然。',
                    '但自然只能建立在设定内，不能突然换性格、换关系、换世界观，也不能把没给出的信息强行补成既定事实。',
                    `角色设定：${roleSummary}`,
                    `用户身份牌：${thread.identityProfileName || '未命名身份牌'}；设定：${identitySummary}`,
                    `已绑定世界书（${worldbooks.length} 条）：\n${worldbookText}`,
                    `本轮调用参数：模型=${settings.model || '未设置'}；温度=${safeTemperature}；上下文上限=${safeContextCount}；实际携带=${carriedContextCount}。`,
                    '如果这一轮是空输入触发，就让角色主动接一句并推进一小步，但仍然不能替用户发言。'
                ].join('\n\n'),
                rulePrompt: [
                    '强制规则：',
                    '1. 只输出一个合法 JSON 对象，禁止 Markdown、解释、前后缀、代码块和多对象拼接。',
                    '2. JSON 顶层必须带 type，建议固定为 "role_reply"，并同时给出 text、emotion、state、worldbook_refs、memory。',
                    '3. text 只能写角色本轮真实会说或会做的内容，绝不替用户说话，绝不替用户决定，也绝不写 OOC 解释。',
                    '4. 回复必须贴合角色设定、用户身份牌、世界书与最近上下文；没有依据就收住，不准乱编世界观事实。',
                    '5. worldbook_refs 只写本轮真实用到的世界书标题；没用到就写空数组。memory 只写本轮延续的关键上下文。',
                    `6. 参数复述：温度=${safeTemperature}；上下文上限=${safeContextCount}；实际携带=${carriedContextCount}；世界书=${worldbooks.length} 条。`,
                    '7. 若用户本轮为空输入，视为“角色主动接一句”，但仍然只能推进角色自己的表达，不能代替用户作答。'
                ].join('\n')
            };
        }

        function buildChatRoleRequestMessages(thread, settings, userText) {
            const historyMessages = getChatRoleHistoryMessages(thread, settings.contextCount);
            const promptBundle = buildChatRolePromptBundle(thread, settings, historyMessages.length);
            const turnMessage = userText
                ? `【用户输入】\n${userText}`
                : '【空输入触发】\n用户这一轮没有输入新内容。请角色基于最近上下文与当前设定主动接一句并推进一轮，但绝不替用户发言。';

            return [
                { role: 'system', content: promptBundle.systemPrompt },
                { role: 'system', content: promptBundle.rulePrompt },
                ...historyMessages,
                { role: 'user', content: turnMessage }
            ];
        }

        function buildChatRoleApiPayloadVariants(endpoint, settings, messages) {
            if (/\/api\/chat$/i.test(endpoint)) {
                return [{
                    model: settings.model,
                    messages,
                    stream: false,
                    format: 'json',
                    options: {
                        temperature: settings.temperature
                    }
                }];
            }

            return [
                {
                    model: settings.model,
                    messages,
                    temperature: settings.temperature,
                    response_format: { type: 'json_object' }
                },
                {
                    model: settings.model,
                    messages,
                    temperature: settings.temperature
                }
            ];
        }

        function extractChatReplyTextFromPayload(payload) {
            if (!payload) return '';
            if (typeof payload === 'string') return payload;

            if (Array.isArray(payload?.choices) && payload.choices.length) {
                const choice = payload.choices[0] || {};
                if (typeof choice.message?.content === 'string') return choice.message.content;
                if (Array.isArray(choice.message?.content)) {
                    return choice.message.content
                        .map(part => (typeof part === 'string' ? part : part?.text || part?.content || ''))
                        .join('');
                }
                if (typeof choice.text === 'string') return choice.text;
            }

            if (typeof payload.message?.content === 'string') return payload.message.content;
            if (Array.isArray(payload.message?.content)) {
                return payload.message.content
                    .map(part => (typeof part === 'string' ? part : part?.text || part?.content || ''))
                    .join('');
            }
            if (typeof payload.response === 'string') return payload.response;
            if (typeof payload.output_text === 'string') return payload.output_text;
            if (typeof payload.content === 'string') return payload.content;

            return '';
        }

        async function requestChatRoleAssistantReply(thread, userText) {
            const settings = normalizeApiChatSettingsState(apiChatSettingsState || {});
            if (!settings.apiUrl) {
                throw new Error('请先去设置页填写 API 接口网址。');
            }
            if (!settings.model) {
                throw new Error('请先去设置页填写模型名称。');
            }

            const requestMessages = buildChatRoleRequestMessages(thread, settings, userText);
            const endpoints = buildApiChatCompletionEndpointCandidates(settings.apiUrl);
            const authVariants = buildApiChatAuthVariants(settings.apiKey);
            let lastError = '';

            for (const endpoint of endpoints) {
                const payloadVariants = buildChatRoleApiPayloadVariants(endpoint, settings, requestMessages);
                for (const authVariant of authVariants) {
                    for (const payload of payloadVariants) {
                        try {
                            const response = await fetch(endpoint, {
                                method: 'POST',
                                headers: {
                                    ...authVariant.headers,
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify(payload),
                                redirect: 'follow'
                            });

                            const rawResponseText = await response.text();
                            if (!response.ok) {
                                lastError = `${response.status} ${response.statusText}`.trim();
                                if (rawResponseText) lastError = `${lastError} ${rawResponseText.slice(0, 180)}`.trim();
                                continue;
                            }

                            let responsePayload = null;
                            try {
                                responsePayload = JSON.parse(rawResponseText);
                            } catch (error) {
                                const directPayload = parseChatRoleAssistantPayload(rawResponseText);
                                if (directPayload && directPayload.displayText) return directPayload;
                                lastError = '接口成功返回，但响应体不是可解析的 JSON。';
                                continue;
                            }

                            const rawReplyText = extractChatReplyTextFromPayload(responsePayload);
                            const normalizedReply = parseChatRoleAssistantPayload(rawReplyText);
                            if (!normalizedReply) {
                                lastError = '模型返回内容不是合法 JSON 对象，或缺少 type 字段。';
                                continue;
                            }
                            if (!normalizedReply.displayText) {
                                lastError = 'JSON 对象缺少可展示文本字段（text / reply / content / message）。';
                                continue;
                            }

                            return normalizedReply;
                        } catch (error) {
                            lastError = error?.message || '请求失败';
                        }
                    }
                }
            }

            throw new Error(lastError || '无法从当前接口拿到合法 JSON 回复。');
        }

        function updateChatRoleSendButtonState() {
            const button = document.getElementById('chat-role-thread-send-btn');
            if (!button) return;
            button.disabled = chatRoleRequestInFlight;
            button.innerText = chatRoleRequestInFlight ? '发送中' : '发送';
        }

        async function sendChatRoleMessage() {
            if (chatRoleRequestInFlight) return;

            const input = document.getElementById('chat-role-thread-input');
            const thread = chatRoleThreads.find(item => item.id === currentChatRoleThreadId);
            if (!input || !thread) return;

            const text = input.value.trim();
            chatRoleRequestInFlight = true;
            updateChatRoleSendButtonState();
            setChatRoleThreadStatus(
                text
                    ? '正在向已配置的 API 请求角色回复。会携带已绑定的用户身份牌、世界书和最近上下文。'
                    : '空输入已触发主动回复。正在向 API 请求角色按设定主动接一句。',
                'working'
            );

            try {
                const reply = await requestChatRoleAssistantReply(thread, text);
                const now = Date.now();

                if (text) {
                    thread.messages.push({
                        id: `user-${now}`,
                        role: 'user',
                        text,
                        rawText: text,
                        createdAt: now
                    });
                }

                thread.messages.push({
                    id: `assistant-${now + 1}`,
                    role: 'assistant',
                    text: reply.displayText,
                    rawText: reply.rawText,
                    payload: reply.object,
                    messageType: reply.type,
                    emotion: reply.emotion,
                    state: reply.state,
                    worldbookRefs: reply.worldbookRefs,
                    memory: reply.memory,
                    createdAt: now + 1
                });

                thread.updatedAt = now + 1;
                chatRoleThreads.sort((a, b) => b.updatedAt - a.updatedAt);
                input.value = '';
                syncChatRoleThreadInputHeight(input);

                await persistChatRoleThreads();
                renderChatRoleThreadList();
                renderChatRoleThreadDetail();
                renderChatRoleThreadMessages();
                setChatRoleThreadStatus('本轮角色回复已完成。返回内容已校验为只包含一个带 type 字段的 JSON 对象。', 'success');
                input.focus();
            } catch (error) {
                setChatRoleThreadStatus(`请求失败：${error?.message || '未知错误'}`, 'error');
            } finally {
                chatRoleRequestInFlight = false;
                updateChatRoleSendButtonState();
            }
        }

        function handleChatRoleThreadInputKeydown(event) {
            if (event.key !== 'Enter' || event.shiftKey) return;

            event.preventDefault();
            void sendChatRoleMessage();
        }

        function handleChatRoleThreadInput(event) {
            syncChatRoleThreadInputHeight(event?.target || document.getElementById('chat-role-thread-input'));
        }

        function syncChatRoleThreadInputHeight(target = document.getElementById('chat-role-thread-input')) {
            const input = target?.target || target;
            if (!input) return;

            const styles = window.getComputedStyle(input);
            const minHeight = Number.parseInt(styles.minHeight, 10) || 46;
            const maxHeight = Number.parseInt(styles.maxHeight, 10) || 160;

            input.style.height = 'auto';
            const nextHeight = Math.min(Math.max(input.scrollHeight, minHeight), maxHeight);
            input.style.height = `${nextHeight}px`;
            input.style.overflowY = input.scrollHeight > maxHeight ? 'auto' : 'hidden';
        }

        function sortNumericIdList(values = []) {
            if (!Array.isArray(values)) return [];
            return [...new Set(values.map(item => Number(item)).filter(Number.isFinite))].sort((a, b) => a - b);
        }

        function safeJsonStringify(value) {
            try {
                return JSON.stringify(value);
            } catch (error) {
                return '';
            }
        }

        function cleanJsonLikeText(rawText = '') {
            return String(rawText || '')
                .trim()
                .replace(/^```json\s*/i, '')
                .replace(/^```\s*/i, '')
                .replace(/\s*```$/i, '')
                .trim();
        }

        function extractFirstJsonObjectString(rawText = '') {
            const source = cleanJsonLikeText(rawText);
            const startIndex = source.indexOf('{');
            if (startIndex < 0) return '';

            let depth = 0;
            let inString = false;
            let isEscaped = false;

            for (let index = startIndex; index < source.length; index += 1) {
                const char = source[index];

                if (inString) {
                    if (isEscaped) {
                        isEscaped = false;
                        continue;
                    }
                    if (char === '\\') {
                        isEscaped = true;
                        continue;
                    }
                    if (char === '"') inString = false;
                    continue;
                }

                if (char === '"') {
                    inString = true;
                    continue;
                }
                if (char === '{') {
                    depth += 1;
                    continue;
                }
                if (char !== '}') continue;

                depth -= 1;
                if (depth === 0) {
                    return source.slice(startIndex, index + 1).trim();
                }
            }

            return '';
        }

        function normalizeStringArrayField(value) {
            if (!Array.isArray(value)) return [];
            return value.map(item => String(item || '').trim()).filter(Boolean);
        }

        function getChatRolePayloadDisplayText(payload = {}) {
            const candidateKeys = ['text', 'reply', 'content', 'message', 'dialogue'];
            for (const key of candidateKeys) {
                const value = String(payload?.[key] || '').trim();
                if (value) return value;
            }
            return '';
        }

        function normalizeParsedChatRolePayload(payload) {
            if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return null;

            const type = String(payload.type || '').trim();
            if (!type) return null;

            return {
                object: payload,
                rawText: safeJsonStringify(payload),
                type,
                displayText: getChatRolePayloadDisplayText(payload),
                emotion: String(payload.emotion || payload.mood || '').trim(),
                state: String(payload.state || payload.intent || '').trim(),
                worldbookRefs: normalizeStringArrayField(payload.worldbook_refs || payload.worldbookRefs || payload.refs),
                memory: normalizeStringArrayField(payload.memory || payload.context || payload.context_used || payload.contextUsed)
            };
        }

        function parseChatRoleAssistantPayload(rawText = '') {
            const directText = cleanJsonLikeText(rawText);
            const parseAttempts = [directText, extractFirstJsonObjectString(directText)].filter(Boolean);

            for (const candidate of parseAttempts) {
                try {
                    const parsed = JSON.parse(candidate);
                    const normalized = normalizeParsedChatRolePayload(parsed);
                    if (normalized) return normalized;
                } catch (error) {
                    continue;
                }
            }

            return null;
        }

        function normalizeChatRoleMessages(messages = []) {
            if (!Array.isArray(messages)) return [];

            return messages
                .map((message, index) => {
                    const role = message?.role === 'user' ? 'user' : 'assistant';
                    const createdAt = Number(message?.createdAt) || (Date.now() + index);
                    const rawText = String(message?.rawText || message?.text || '').trim();
                    const parsedPayload = role === 'assistant'
                        ? normalizeParsedChatRolePayload(message?.payload) || parseChatRoleAssistantPayload(rawText)
                        : null;
                    const text = role === 'assistant'
                        ? (parsedPayload?.displayText || String(message?.text || '').trim() || rawText)
                        : String(message?.text || rawText).trim();

                    if (role === 'user' && !text) return null;
                    if (role === 'assistant' && !text && !parsedPayload?.rawText) return null;

                    return {
                        id: message?.id || `${role}-${createdAt}-${index}`,
                        role,
                        text: text || '',
                        rawText: role === 'assistant'
                            ? (parsedPayload?.rawText || rawText || safeJsonStringify(message?.payload) || '')
                            : text,
                        payload: parsedPayload?.object || null,
                        messageType: parsedPayload?.type || '',
                        emotion: parsedPayload?.emotion || '',
                        state: parsedPayload?.state || '',
                        worldbookRefs: parsedPayload?.worldbookRefs || [],
                        memory: parsedPayload?.memory || [],
                        createdAt
                    };
                })
                .filter(Boolean);
        }

        function normalizeChatRoleThreads(threads = []) {
            if (!Array.isArray(threads)) return [];

            return threads
                .map((thread, index) => {
                    const updatedAt = Number(thread?.updatedAt) || (Date.now() + index);
                    const createdAt = Number(thread?.createdAt) || updatedAt;

                    return {
                        id: Number(thread?.id) || (updatedAt + index),
                        archiveId: Number.isFinite(Number(thread?.archiveId)) ? Number(thread.archiveId) : null,
                        name: String(thread?.name || '未命名角色').trim() || '未命名角色',
                        type: String(thread?.type || 'char').trim() || 'char',
                        summary: String(thread?.summary || '').trim(),
                        imageFile: thread?.imageFile instanceof Blob ? thread.imageFile : null,
                        identityProfileId: Number.isFinite(Number(thread?.identityProfileId)) ? Number(thread.identityProfileId) : null,
                        identityProfileName: String(thread?.identityProfileName || '').trim(),
                        identitySummary: String(thread?.identitySummary || '').trim(),
                        identityImageFile: thread?.identityImageFile instanceof Blob ? thread.identityImageFile : null,
                        worldbookIds: sortNumericIdList(thread?.worldbookIds),
                        createdAt,
                        updatedAt,
                        messages: normalizeChatRoleMessages(thread?.messages)
                    };
                })
                .sort((a, b) => b.updatedAt - a.updatedAt);
        }

        function getChatRoleMessageDisplayText(message) {
            return String(message?.text || '').trim();
        }

        function getChatRoleMessageRawContent(message) {
            if (!message) return '';
            if (message.role === 'assistant') return String(message.rawText || safeJsonStringify(message.payload) || message.text || '').trim();
            return String(message.text || '').trim();
        }

        function getArchiveProfileById(id) {
            return archiveProfiles.find(item => item.id === id) || null;
        }

        function getWorldbookEntryById(id) {
            return worldbookList.find(item => item.id === id) || null;
        }

        function getChatRoleCandidateProfiles() {
            return archiveProfiles.filter(entry => entry.type !== 'user');
        }

        function getChatIdentityProfiles() {
            return archiveProfiles.filter(entry => entry.type === 'user');
        }

        function getChatRoleThreadWorldbooks(thread) {
            if (!thread) return [];
            return sortNumericIdList(thread.worldbookIds)
                .map(id => getWorldbookEntryById(id))
                .filter(Boolean);
        }

        function buildChatRoleThreadFallbackPreview(thread) {
            const identityName = String(thread?.identityProfileName || '').trim();
            const worldbookCount = getChatRoleThreadWorldbooks(thread).length;
            const segments = [];
            if (identityName) segments.push(`身份牌：${identityName}`);
            if (worldbookCount) segments.push(`世界书 ${worldbookCount} 条`);
            return segments.length ? segments.join(' · ') : '已加入消息页，点击继续聊天。';
        }

        function getChatRoleThreadPreview(thread) {
            const lastMessage = thread?.messages?.[thread.messages.length - 1];
            return buildChatRoleSummary(
                getChatRoleMessageDisplayText(lastMessage) || thread?.summary || buildChatRoleThreadFallbackPreview(thread),
                46
            ) || buildChatRoleThreadFallbackPreview(thread);
        }

        function createChatRoleConfigState(thread = null) {
            const defaultIdentity = getChatIdentityProfiles()[0] || null;
            const defaultWorldbookIds = worldbookList[0] ? [worldbookList[0].id] : [];

            if (!thread) {
                return {
                    threadId: null,
                    archiveId: null,
                    identityProfileId: defaultIdentity?.id || null,
                    worldbookIds: defaultWorldbookIds
                };
            }

            return {
                threadId: thread.id,
                archiveId: thread.archiveId,
                identityProfileId: thread.identityProfileId || defaultIdentity?.id || null,
                worldbookIds: sortNumericIdList(thread.worldbookIds).length
                    ? sortNumericIdList(thread.worldbookIds)
                    : defaultWorldbookIds
            };
        }

        function syncChatRoleThreadsWithArchiveProfiles() {
            if (!chatRoleThreads.length) return false;

            const archiveMap = new Map(archiveProfiles.map(entry => [entry.id, entry]));
            let changed = false;

            chatRoleThreads = chatRoleThreads
                .map(thread => {
                    const nextThread = {
                        ...thread,
                        worldbookIds: sortNumericIdList(thread.worldbookIds)
                    };
                    const archiveEntry = archiveMap.get(thread.archiveId);
                    const identityEntry = archiveMap.get(thread.identityProfileId);

                    if (archiveEntry) {
                        nextThread.name = String(archiveEntry.name || thread.name || '未命名角色').trim() || '未命名角色';
                        nextThread.type = String(archiveEntry.type || thread.type || 'char').trim() || 'char';
                        nextThread.summary = String(archiveEntry.content || thread.summary || '').trim();
                        nextThread.imageFile = archiveEntry.imageFile || null;
                    }

                    if (identityEntry) {
                        nextThread.identityProfileName = String(identityEntry.name || thread.identityProfileName || '未命名身份牌').trim() || '未命名身份牌';
                        nextThread.identitySummary = String(identityEntry.content || thread.identitySummary || '').trim();
                        nextThread.identityImageFile = identityEntry.imageFile || null;
                    }

                    if (
                        nextThread.name !== thread.name
                        || nextThread.type !== thread.type
                        || nextThread.summary !== thread.summary
                        || !arePreviewFilesEquivalent(nextThread.imageFile, thread.imageFile)
                        || nextThread.identityProfileName !== thread.identityProfileName
                        || nextThread.identitySummary !== thread.identitySummary
                        || !arePreviewFilesEquivalent(nextThread.identityImageFile, thread.identityImageFile)
                        || nextThread.worldbookIds.join(',') !== sortNumericIdList(thread.worldbookIds).join(',')
                    ) {
                        changed = true;
                    }

                    return nextThread;
                })
                .sort((a, b) => b.updatedAt - a.updatedAt);

            return changed;
        }

        function syncChatRoleThreadsWithWorldbooks() {
            if (!chatRoleThreads.length) return false;

            const validWorldbookIds = new Set(worldbookList.map(entry => entry.id));
            let changed = false;

            chatRoleThreads = chatRoleThreads
                .map(thread => {
                    const nextWorldbookIds = sortNumericIdList(thread.worldbookIds).filter(id => validWorldbookIds.has(id));
                    if (nextWorldbookIds.join(',') !== sortNumericIdList(thread.worldbookIds).join(',')) changed = true;
                    return {
                        ...thread,
                        worldbookIds: nextWorldbookIds
                    };
                })
                .sort((a, b) => b.updatedAt - a.updatedAt);

            return changed;
        }

        async function initChatRoleThreadsData() {
            const savedThreads = await appDB.getChatRoleThreads();
            chatRoleThreads = normalizeChatRoleThreads(savedThreads?.threads);

            const chatThreadsChanged = syncChatRoleThreadsWithArchiveProfiles();
            const chatWorldbookChanged = syncChatRoleThreadsWithWorldbooks();
            currentChatRoleThreadId = chatRoleThreads.some(thread => thread.id === currentChatRoleThreadId)
                ? currentChatRoleThreadId
                : (chatRoleThreads[0]?.id || null);

            renderChatRoleThreadList();
            renderChatRoleConfigScreen();
            renderChatRoleThreadDetail();

            if (chatThreadsChanged || chatWorldbookChanged) await persistChatRoleThreads();
        }

        async function persistChatRoleThreads() {
            chatRoleThreads.sort((a, b) => b.updatedAt - a.updatedAt);
            await appDB.saveChatRoleThreads({
                threads: chatRoleThreads,
                updatedAt: Date.now()
            });
        }

        function toggleChatSubscreen(id, show) {
            const screen = document.getElementById(id);
            if (!screen) return;

            if (screen._hideTimer) {
                clearTimeout(screen._hideTimer);
                screen._hideTimer = null;
            }

            if (show) {
                screen.style.display = 'flex';
                screen.offsetHeight;
                screen.style.opacity = '1';
                return;
            }

            screen.style.opacity = '0';
            screen._hideTimer = setTimeout(() => {
                screen.style.display = 'none';
                screen._hideTimer = null;
            }, 220);
        }

        function setChatRoleConfigStatus(message, tone = 'default') {
            const element = document.getElementById('chat-role-config-status');
            if (!element) return;
            element.innerText = message;
            if (tone === 'default') delete element.dataset.tone;
            else element.dataset.tone = tone;
        }

        function setChatRoleThreadStatus(message, tone = 'default') {
            const element = document.getElementById('chat-role-thread-status');
            if (!element) return;
            element.innerText = message;
            if (tone === 'default') delete element.dataset.tone;
            else element.dataset.tone = tone;
        }

        function updateChatRoleConfigSummary() {
            const roleEntry = getArchiveProfileById(currentChatRoleConfigState.archiveId);
            const identityEntry = getArchiveProfileById(currentChatRoleConfigState.identityProfileId);
            const selectedWorldbooks = currentChatRoleConfigState.worldbookIds
                .map(id => getWorldbookEntryById(id))
                .filter(Boolean);
            const editingThread = chatRoleThreads.find(thread => thread.id === currentChatRoleConfigState.threadId);
            const title = document.getElementById('chat-role-picker-title');
            const roleStatus = document.getElementById('chat-role-config-role-status');
            const identityStatus = document.getElementById('chat-role-config-identity-status');
            const worldbookStatus = document.getElementById('chat-role-config-worldbook-status');
            const roleSummary = document.getElementById('chat-role-config-summary-role');
            const identitySummary = document.getElementById('chat-role-config-summary-identity');
            const worldbookSummary = document.getElementById('chat-role-config-summary-worldbook');
            const confirmButton = document.getElementById('chat-role-config-confirm-btn');
            const deleteButton = document.getElementById('chat-role-delete-thread-btn');

            if (title) title.innerText = editingThread ? '编辑角色绑定' : '添加角色';
            if (roleStatus) roleStatus.innerText = roleEntry ? '已选择' : '未选择';
            if (identityStatus) identityStatus.innerText = identityEntry ? '已选择' : '未选择';
            if (worldbookStatus) worldbookStatus.innerText = `${selectedWorldbooks.length} 条`;
            if (roleSummary) roleSummary.innerText = roleEntry ? roleEntry.name || '未命名角色' : '未选择';
            if (identitySummary) identitySummary.innerText = identityEntry ? identityEntry.name || '未命名身份牌' : '未选择';
            if (confirmButton) confirmButton.innerText = editingThread ? '保存绑定' : '加入消息页并进入聊天';
            if (deleteButton) deleteButton.style.display = editingThread ? 'block' : 'none';
            if (worldbookSummary) {
                worldbookSummary.innerText = selectedWorldbooks.length
                    ? selectedWorldbooks.map(entry => entry.title || '未命名条目').join('、')
                    : '0 条';
            }
        }

        function selectChatRoleConfigArchive(id) {
            currentChatRoleConfigState.archiveId = id;
            renderChatRoleConfigScreen();
        }

        function selectChatRoleConfigIdentity(id) {
            currentChatRoleConfigState.identityProfileId = id;
            renderChatRoleConfigScreen();
        }

        function toggleChatRoleConfigWorldbook(id) {
            const currentIds = sortNumericIdList(currentChatRoleConfigState.worldbookIds);
            currentChatRoleConfigState.worldbookIds = currentIds.includes(id)
                ? currentIds.filter(item => item !== id)
                : sortNumericIdList([...currentIds, id]);
            renderChatRoleConfigScreen();
        }

        function renderChatRoleArchivePickerList(containerId, entries, selectedId, emptyHtml, onSelect) {
            const container = document.getElementById(containerId);
            if (!container) return;

            if (!entries.length) {
                container.innerHTML = `<div class="chat-role-picker-empty">${emptyHtml}</div>`;
                return;
            }

            container.innerHTML = '';
            entries.forEach(entry => {
                const typeLabel = getArchiveTypeLabel(entry.type);
                const selected = entry.id === selectedId;
                const card = document.createElement('div');
                card.className = `chat-role-picker-card ${selected ? 'selected' : ''}`;
                card.innerHTML = `
                    <div class="chat-role-picker-avatar"></div>
                    <div class="chat-role-picker-main">
                        <div class="chat-role-picker-name">${escapeHtml(entry.name || '未命名角色')}</div>
                        <div class="chat-role-picker-meta">
                            <span>${escapeHtml(typeLabel)}</span>
                            <span>${escapeHtml(entry.gender || '未设定')}</span>
                        </div>
                        <div class="chat-role-picker-desc">${escapeHtml(buildChatRoleSummary(entry.content || '', 70) || '这张档案还没有填写详细设定。')}</div>
                    </div>
                    <button class="chat-role-picker-btn ${selected ? 'active' : ''}" type="button">${selected ? '已选中' : '选择'}</button>
                `;

                setBackgroundFilePreview(
                    card.querySelector('.chat-role-picker-avatar'),
                    entry.imageFile,
                    `<span class="chat-role-picker-avatar-label">${escapeHtml(typeLabel)}</span>`
                );

                card.addEventListener('click', () => onSelect(entry.id));
                card.querySelector('.chat-role-picker-btn').addEventListener('click', event => {
                    event.stopPropagation();
                    onSelect(entry.id);
                });

                container.appendChild(card);
            });
        }

        function renderChatRoleWorldbookList() {
            const container = document.getElementById('chat-role-worldbook-picker-list');
            if (!container) return;

            if (!worldbookList.length) {
                container.innerHTML = '<div class="chat-role-picker-empty">还没有世界书条目。先去世界书页面创建至少 1 条条目，再回来绑定到角色会话。</div>';
                return;
            }

            const selectedIds = sortNumericIdList(currentChatRoleConfigState.worldbookIds);
            container.innerHTML = '';
            worldbookList.forEach(entry => {
                const selected = selectedIds.includes(entry.id);
                const card = document.createElement('div');
                const keywordsText = Array.isArray(entry.keywords) && entry.keywords.length
                    ? `关键词：${entry.keywords.join(' / ')}`
                    : '无关键词';

                card.className = `chat-role-worldbook-card ${selected ? 'selected' : ''}`;
                card.innerHTML = `
                    <div class="chat-role-worldbook-main">
                        <div class="chat-role-worldbook-title">${escapeHtml(entry.title || '未命名条目')}</div>
                        <div class="chat-role-worldbook-meta">
                            <span>${escapeHtml(getWorldbookScopeLabel(entry.scope))}</span>
                            <span>${escapeHtml(getWorldbookTriggerLabel(entry.triggerMode))}</span>
                            <span>注入${escapeHtml(getWorldbookInjectLabel(entry.injectPosition))}</span>
                        </div>
                        <div class="chat-role-worldbook-desc">${escapeHtml(buildChatRoleSummary(`${keywordsText} ${entry.content || ''}`, 90) || '暂无内容')}</div>
                    </div>
                    <div class="chat-role-worldbook-check">${selected ? '已绑定' : '绑定'}</div>
                `;

                card.addEventListener('click', () => toggleChatRoleConfigWorldbook(entry.id));
                container.appendChild(card);
            });
        }

        function renderChatRoleConfigScreen() {
            renderChatRoleArchivePickerList(
                'chat-role-picker-list',
                getChatRoleCandidateProfiles(),
                currentChatRoleConfigState.archiveId,
                '还没有 CHAR / NPC 档案。先去档案页创建角色卡，再回来加入消息页。',
                selectChatRoleConfigArchive
            );
            renderChatRoleArchivePickerList(
                'chat-role-identity-picker-list',
                getChatIdentityProfiles(),
                currentChatRoleConfigState.identityProfileId,
                '还没有 USER 档案。先去档案页 USER 分栏创建一张用户身份牌。',
                selectChatRoleConfigIdentity
            );
            renderChatRoleWorldbookList();
            updateChatRoleConfigSummary();
            feather.replace({ 'stroke-width': 1.2 });
        }

        function renderChatRolePickerList() {
            renderChatRoleConfigScreen();
        }

        function openChatRoleConfigScreen(threadId = null) {
            const thread = chatRoleThreads.find(item => item.id === threadId) || null;
            currentChatRoleConfigState = createChatRoleConfigState(thread);
            renderChatRoleConfigScreen();
            setChatRoleConfigStatus(
                thread
                    ? '这里可以重新选择双方档案、调整世界书绑定，保存后会保留当前历史消息；也可以直接删除这条聊天。'
                    : '创建会话时会同时绑定角色、用户身份牌和至少 1 条世界书。',
                'default'
            );
            toggleChatSubscreen('chat-role-picker-screen', true);
        }

        function openChatRolePicker() {
            openChatRoleConfigScreen();
        }

        function closeChatRolePicker(event) {
            if (event && event.target !== event.currentTarget) return;
            toggleChatSubscreen('chat-role-picker-screen', false);
        }

        async function deleteCurrentChatRoleThread() {
            const targetThreadId = currentChatRoleConfigState.threadId || currentChatRoleThreadId;
            const thread = chatRoleThreads.find(item => item.id === targetThreadId);
            if (!thread) {
                setChatRoleConfigStatus('当前没有可删除的聊天。', 'error');
                return;
            }
            if (!confirm(`确认删除和 ${thread.name} 的聊天吗？`)) return;

            chatRoleThreads = chatRoleThreads.filter(item => item.id !== targetThreadId);
            if (currentChatRoleThreadId === targetThreadId) {
                currentChatRoleThreadId = chatRoleThreads[0]?.id || null;
            }
            currentChatRoleConfigState = createChatRoleConfigState(null);

            await persistChatRoleThreads();
            renderChatRoleThreadList();
            renderChatRoleConfigScreen();
            renderChatRoleThreadDetail();
            renderChatRoleThreadMessages();
            closeChatRolePicker(null);
            closeChatRoleThread(null);
        }

        async function confirmChatRoleConfig() {
            const roleEntry = getArchiveProfileById(currentChatRoleConfigState.archiveId);
            const identityEntry = getArchiveProfileById(currentChatRoleConfigState.identityProfileId);
            const selectedWorldbooks = currentChatRoleConfigState.worldbookIds
                .map(id => getWorldbookEntryById(id))
                .filter(Boolean);

            if (!roleEntry || roleEntry.type === 'user') {
                setChatRoleConfigStatus('请先选择一张 CHAR / NPC 角色卡。', 'error');
                return;
            }
            if (!identityEntry || identityEntry.type !== 'user') {
                setChatRoleConfigStatus('请先绑定一张 USER 身份牌。', 'error');
                return;
            }
            if (!selectedWorldbooks.length) {
                setChatRoleConfigStatus('请至少绑定 1 条世界书条目。', 'error');
                return;
            }

            const now = Date.now();
            const existingThread = chatRoleThreads.find(thread => thread.id === currentChatRoleConfigState.threadId)
                || chatRoleThreads.find(thread => thread.archiveId === roleEntry.id);
            let thread = existingThread || null;

            if (thread) {
                thread.archiveId = roleEntry.id;
                thread.name = String(roleEntry.name || thread.name || '未命名角色').trim() || '未命名角色';
                thread.type = String(roleEntry.type || thread.type || 'char').trim() || 'char';
                thread.summary = String(roleEntry.content || thread.summary || '').trim();
                thread.imageFile = roleEntry.imageFile || null;
                thread.identityProfileId = identityEntry.id;
                thread.identityProfileName = String(identityEntry.name || thread.identityProfileName || '未命名身份牌').trim() || '未命名身份牌';
                thread.identitySummary = String(identityEntry.content || thread.identitySummary || '').trim();
                thread.identityImageFile = identityEntry.imageFile || null;
                thread.worldbookIds = sortNumericIdList(selectedWorldbooks.map(entry => entry.id));
                thread.updatedAt = now;
            } else {
                thread = {
                    id: now,
                    archiveId: roleEntry.id,
                    name: String(roleEntry.name || '未命名角色').trim() || '未命名角色',
                    type: String(roleEntry.type || 'char').trim() || 'char',
                    summary: String(roleEntry.content || '').trim(),
                    imageFile: roleEntry.imageFile || null,
                    identityProfileId: identityEntry.id,
                    identityProfileName: String(identityEntry.name || '未命名身份牌').trim() || '未命名身份牌',
                    identitySummary: String(identityEntry.content || '').trim(),
                    identityImageFile: identityEntry.imageFile || null,
                    worldbookIds: sortNumericIdList(selectedWorldbooks.map(entry => entry.id)),
                    createdAt: now,
                    updatedAt: now,
                    messages: []
                };
                chatRoleThreads.unshift(thread);
            }

            currentChatRoleThreadId = thread.id;
            await persistChatRoleThreads();
            renderChatRoleThreadList();
            closeChatRolePicker(null);
            openChatRoleThread(thread.id);
            setChatRoleThreadStatus('角色绑定已更新。发送消息或直接空发送，都会按当前设定向 API 发起请求。', 'success');
        }

        function openChatRoleThreadByArchiveId(archiveId) {
            const thread = chatRoleThreads.find(item => item.archiveId === archiveId);
            if (!thread) return;

            closeChatRolePicker(null);
            openChatRoleThread(thread.id);
        }

        function renderChatRoleThreadList() {
            const container = document.getElementById('chat-role-thread-list');
            if (!container) return;

            if (!chatRoleThreads.length) {
                container.innerHTML = '<div class="chat-role-empty">还没有角色会话。点右侧 + 选择角色、用户身份牌和世界书后，就能进入完整聊天页面。</div>';
                return;
            }

            container.innerHTML = '';
            chatRoleThreads
                .sort((a, b) => b.updatedAt - a.updatedAt)
                .forEach(thread => {
                    const typeLabel = getArchiveTypeLabel(thread.type);
                    const identityLabel = String(thread.identityProfileName || '').trim();
                    const card = document.createElement('div');
                    card.className = 'chat-thread chat-thread-role';
                    card.innerHTML = `
                        <div class="chat-thread-avatar chat-role-thread-avatar"></div>
                        <div class="chat-thread-main">
                            <div class="chat-thread-name-row">
                                <div class="chat-thread-name">${escapeHtml(thread.name)}</div>
                                <button class="chat-thread-tag chat-thread-config-trigger" type="button" title="编辑当前会话绑定">${escapeHtml(typeLabel)}</button>
                                ${identityLabel ? `<div class="chat-thread-tag">${escapeHtml(identityLabel)}</div>` : ''}
                            </div>
                            <div class="chat-thread-snippet">${escapeHtml(getChatRoleThreadPreview(thread))}</div>
                        </div>
                        <div class="chat-thread-meta">
                            <span>${escapeHtml(formatChatRoleTime(thread.updatedAt))}</span>
                            <div class="chat-thread-badge">${thread.messages.length}</div>
                        </div>
                    `;

                    setBackgroundFilePreview(
                        card.querySelector('.chat-role-thread-avatar'),
                        thread.imageFile,
                        `<span class="chat-thread-role-avatar-label">${escapeHtml(typeLabel)}</span>`
                    );

                    const configTrigger = card.querySelector('.chat-thread-config-trigger');
                    if (configTrigger) {
                        configTrigger.addEventListener('click', event => {
                            event.stopPropagation();
                            openChatRoleConfigScreen(thread.id);
                        });
                    }
                    card.addEventListener('click', () => openChatRoleThread(thread.id));
                    container.appendChild(card);
                });

            feather.replace({ 'stroke-width': 1.2 });
        }

        function renderChatRoleThreadDetail() {
            const thread = chatRoleThreads.find(item => item.id === currentChatRoleThreadId);
            const worldbookContainer = document.getElementById('chat-role-thread-worldbooks');
            if (!thread) {
                document.getElementById('chat-role-thread-title').innerText = '角色会话';
                document.getElementById('chat-role-thread-subtitle').innerText = '档案角色聊天';
                document.getElementById('chat-role-thread-hero-name').innerText = '角色会话';
                document.getElementById('chat-role-thread-hero-summary').innerText = '档案角色聊天';
                document.getElementById('chat-role-thread-identity').innerText = '未关联';
                document.getElementById('chat-role-thread-worldbook-count').innerText = '0 条';
                document.getElementById('chat-role-thread-model-chip').innerText = '模型未设置';
                document.getElementById('chat-role-thread-context-chip').innerText = '上下文 0';
                document.getElementById('chat-role-thread-temperature-chip').innerText = '温度 1.0';
                setBackgroundFilePreview(
                    document.getElementById('chat-role-thread-avatar'),
                    null,
                    '<i data-feather="user"></i>'
                );
                if (worldbookContainer) worldbookContainer.innerHTML = '';
                feather.replace({ 'stroke-width': 1.2 });
                return;
            }

            const typeLabel = getArchiveTypeLabel(thread.type);
            const worldbooks = getChatRoleThreadWorldbooks(thread);
            const normalizedSettings = normalizeApiChatSettingsState(apiChatSettingsState || {});

            document.getElementById('chat-role-thread-title').innerText = thread.name;
            document.getElementById('chat-role-thread-subtitle').innerText = `${typeLabel} 档案角色聊天`;
            document.getElementById('chat-role-thread-hero-name').innerText = thread.name;
            document.getElementById('chat-role-thread-hero-summary').innerText = buildChatRoleSummary(thread.summary || '', 110) || `${typeLabel} 档案角色聊天`;
            document.getElementById('chat-role-thread-identity').innerText = thread.identityProfileName || '未绑定身份牌';
            document.getElementById('chat-role-thread-worldbook-count').innerText = `${worldbooks.length} 条`;
            document.getElementById('chat-role-thread-model-chip').innerText = normalizedSettings.model ? `模型 ${normalizedSettings.model}` : '模型未设置';
            document.getElementById('chat-role-thread-context-chip').innerText = `上下文 ${Math.max(0, Number.parseInt(normalizedSettings.contextCount, 10) || 0)}`;
            document.getElementById('chat-role-thread-temperature-chip').innerText = `温度 ${Number(normalizedSettings.temperature).toFixed(1)}`;

            setBackgroundFilePreview(
                document.getElementById('chat-role-thread-avatar'),
                thread.imageFile,
                `<span class="chat-thread-role-avatar-label">${escapeHtml(typeLabel)}</span>`
            );

            if (worldbookContainer) {
                if (!worldbooks.length) {
                    worldbookContainer.innerHTML = '<div class="chat-role-thread-chip">未绑定世界书</div>';
                } else {
                    worldbookContainer.innerHTML = worldbooks.map(entry => `<div class="chat-role-thread-chip">${escapeHtml(entry.title || '未命名条目')}</div>`).join('');
                }
            }

            feather.replace({ 'stroke-width': 1.2 });
        }

        function openChatRoleThread(threadId) {
            const thread = chatRoleThreads.find(item => item.id === threadId);
            if (!thread) return;

            currentChatRoleThreadId = thread.id;
            renderChatRoleThreadDetail();
            renderChatRoleThreadMessages();
            toggleChatSubscreen('chat-role-thread-screen', true);
            setTimeout(() => {
                const input = document.getElementById('chat-role-thread-input');
                if (input) {
                    syncChatRoleThreadInputHeight(input);
                    input.focus();
                }
            }, 80);
        }

        function closeChatRoleThread(event) {
            if (event && event.target !== event.currentTarget) return;
            toggleChatSubscreen('chat-role-thread-screen', false);
        }

        function openCurrentChatRoleConfig() {
            if (!currentChatRoleThreadId) return;
            openChatRoleConfigScreen(currentChatRoleThreadId);
        }

        function renderChatRoleThreadMessages() {
            const container = document.getElementById('chat-role-thread-messages');
            if (!container) return;

            const thread = chatRoleThreads.find(item => item.id === currentChatRoleThreadId);
            if (!thread || !thread.messages.length) {
                container.innerHTML = '<div class="chat-role-thread-empty">这里还没有消息。输入一句话开始对话，或者直接空发送，让角色按当前设定主动接一句。</div>';
                return;
            }

            container.innerHTML = '';
            thread.messages.forEach(message => {
                const displayText = getChatRoleMessageDisplayText(message) || getChatRoleMessageRawContent(message);
                const assistantContent = message.role === 'assistant'
                    ? `
                        ${message.messageType ? `<div class="chat-role-bubble-type">${escapeHtml(message.messageType)}</div>` : ''}
                        <div>${escapeHtml(displayText).replace(/\n/g, '<br>')}</div>
                        ${(message.emotion || message.state || message.worldbookRefs.length || message.memory.length) ? `
                            <div class="chat-role-bubble-extra">
                                ${message.emotion ? `<span>情绪 ${escapeHtml(message.emotion)}</span>` : ''}
                                ${message.state ? `<span>状态 ${escapeHtml(message.state)}</span>` : ''}
                                ${message.worldbookRefs.length ? `<span>世界书 ${escapeHtml(message.worldbookRefs.join(' / '))}</span>` : ''}
                                ${message.memory.length ? `<span>上下文 ${escapeHtml(message.memory.join(' / '))}</span>` : ''}
                            </div>
                        ` : ''}
                    `
                    : `${escapeHtml(displayText).replace(/\n/g, '<br>')}`;

                const item = document.createElement('div');
                item.className = `chat-role-message ${message.role === 'user' ? 'user' : 'assistant'}`;
                item.innerHTML = `
                    <div class="chat-role-bubble">${assistantContent}</div>
                    <div class="chat-role-bubble-meta">${escapeHtml(formatChatRoleTime(message.createdAt, true))}</div>
                `;
                container.appendChild(item);
            });

            container.scrollTop = container.scrollHeight;
        }

        function openChatApp() {
            document.getElementById('home-screen').style.display = 'none';
            renderChatRoleThreadList();
            renderChatRoleConfigScreen();
            renderChatRoleThreadDetail();
            updateChatRoleSendButtonState();
            switchChatTab(currentChatTab);
            const screen = document.getElementById('chat-screen');
            screen.style.display = 'flex';
            setTimeout(() => screen.style.opacity = '1', 50);
        }

        function closeChatApp() {
            const screen = document.getElementById('chat-screen');
            closeChatRolePicker(null);
            closeChatRoleThread(null);
            screen.style.opacity = '0';
            setTimeout(() => {
                screen.style.display = 'none';
                const home = document.getElementById('home-screen');
                home.style.display = 'flex';
                home.offsetHeight;
                home.style.opacity = '1';
            }, 300);
        }

        function switchChatTab(tab) {
            currentChatTab = tab;
            const titles = {
                threads: ['聊天', 'PRIVATE CHANNELS'],
                moments: ['朋友圈', 'VISUAL LOG'],
                profile: ['个人', 'IDENTITY PANEL']
            };

            document.querySelectorAll('.chat-dock-btn').forEach(button => {
                button.classList.toggle('active', button.dataset.tab === tab);
            });
            document.querySelectorAll('.chat-panel').forEach(panel => {
                panel.classList.toggle('active', panel.id === `chat-panel-${tab}`);
            });

            document.getElementById('chat-header-title').innerText = titles[tab][0];
            document.getElementById('chat-header-subtitle').innerText = titles[tab][1];
            if (tab === 'threads') {
                renderChatRoleThreadList();
            }
            feather.replace({ 'stroke-width': 1.2 });
        }

        // --- 论坛帖子详情相关 ---
        function openPostDetail() {
            const fHome = document.getElementById('forum-home-screen');
            const fPost = document.getElementById('forum-post-screen');
            fHome.style.opacity = '0';
            setTimeout(() => {
                fHome.style.display = 'none';
                fPost.style.display = 'flex';
                setTimeout(() => fPost.style.opacity = '1', 50);
            }, 300);
        }

        function closePostDetail() {
            const fPost = document.getElementById('forum-post-screen');
            const fHome = document.getElementById('forum-home-screen');
            fPost.style.opacity = '0';
            setTimeout(() => {
                fPost.style.display = 'none';
                fHome.style.display = 'flex';
                setTimeout(() => fHome.style.opacity = '1', 50);
            }, 300);
        }

        // --- 论坛功能 ---
        function openForum() {
            document.getElementById('home-screen').style.display = 'none';
            document.getElementById('forum-home-screen').style.display = 'flex';
            setTimeout(() => document.getElementById('forum-home-screen').style.opacity = '1', 50);
        }

        function switchForumTab(tab) {
            const fHome = document.getElementById('forum-home-screen');
            const fProfile = document.getElementById('forum-profile-screen');
            if (tab === 'home') {
                fProfile.style.opacity = '0';
                setTimeout(() => {
                    fProfile.style.display = 'none';
                    fHome.style.display = 'flex';
                    fHome.style.opacity = '1';
                }, 200);
            } else if (tab === 'profile') {
                fHome.style.opacity = '0';
                setTimeout(() => {
                    fHome.style.display = 'none';
                    fProfile.style.display = 'flex';
                    fProfile.style.opacity = '1';
                }, 200);
            }
        }

        function exitForum() {
            document.getElementById('forum-home-screen').style.opacity = '0';
            document.getElementById('forum-profile-screen').style.opacity = '0';
            setTimeout(() => {
                document.getElementById('forum-home-screen').style.display = 'none';
                document.getElementById('forum-profile-screen').style.display = 'none';
                const home = document.getElementById('home-screen');
                home.style.display = 'flex';
                home.style.opacity = '1';
            }, 300);
        }

        async function saveForumProfileForm() {
            forumProfileState = {
                ...forumProfileState,
                ...readProfileFormFields(FORUM_PROFILE_FORM_IDS)
            };

            await persistForumProfileState();
            applyForumProfileUI();
            populateForumProfileForm();
            populateChatProfileForm();
            flashProfileSaveButton('profile-save-btn');
        }

        async function saveChatProfileForm() {
            forumProfileState = {
                ...forumProfileState,
                ...readProfileFormFields(CHAT_PROFILE_FORM_IDS)
            };

            await persistForumProfileState();
            applyForumProfileUI();
            populateForumProfileForm();
            populateChatProfileForm();
            flashProfileSaveButton('chat-profile-save-btn');
            setTimeout(() => closeChatProfileEditor(null), 180);
        }

        async function editProfile(type) {
            openChatProfileEditor(type === 'name' ? 'name' : 'profileId');
        }

        // --- 主题与设置页面交互 ---
        function openThemeSettings() {
            document.getElementById('home-screen').style.display = 'none';
            const theme = document.getElementById('theme-screen');
            theme.style.display = 'flex';
            setTimeout(() => theme.style.opacity = '1', 50);
        }

        function closeThemeSettings() {
            const theme = document.getElementById('theme-screen');
            theme.style.opacity = '0';
            setTimeout(() => {
                theme.style.display = 'none';
                const home = document.getElementById('home-screen');
                home.style.display = 'flex';
                home.offsetHeight;
                home.style.opacity = '1';
            }, 300);
        }

        function openSettings() {
            document.getElementById('home-screen').style.display = 'none';
            populateApiChatForm();
            populateApiVoiceForm();
            populateSecurityForm();
            void refreshDataManagementPanel();
            setDataManagementStatus('勾选需要操作的数据类型后，可批量导出、导入或清空。导出文件名格式为 Yu-日期-时间.json。');
            const settings = document.getElementById('settings-screen');
            settings.style.display = 'flex';
            setTimeout(() => settings.style.opacity = '1', 50);
        }

        function closeSettings() {
            const settings = document.getElementById('settings-screen');
            settings.style.opacity = '0';
            setTimeout(() => {
                settings.style.display = 'none';
                const home = document.getElementById('home-screen');
                home.style.display = 'flex';
                home.offsetHeight; // force reflow
                home.style.opacity = '1';
            }, 300);
        }

        function toggleSettingItem(element) {
            element.classList.toggle('open');
            // 兼容 feather.replace 替换后的 svg 标签
            const icon = element.querySelector('.setting-toggle i') || element.querySelector('.setting-toggle svg');
            if (element.classList.contains('open')) {
                icon.setAttribute('data-feather', 'chevron-up');
            } else {
                icon.setAttribute('data-feather', 'chevron-down');
            }
            feather.replace({ 'stroke-width': 1.2 });
        }

        // --- 世界书功能 ---
        let worldbookList = [];
        let currentWorldbookEditId = null;
        let worldbookFormState = {
            scope: 'global',
            triggerMode: 'always',
            injectPosition: 'before'
        };

        async function initWorldbookData() {
            worldbookList = await appDB.listWorldbooks();
            worldbookList.sort((a, b) => (b.updatedAt || b.id) - (a.updatedAt || a.id));
            renderWorldbookList();
            const chatWorldbookChanged = syncChatRoleThreadsWithWorldbooks();
            renderChatRoleConfigScreen();
            renderChatRoleThreadDetail();
            renderChatRoleThreadList();
            if (chatWorldbookChanged) await persistChatRoleThreads();
        }

        function openWorldbook() {
            document.getElementById('home-screen').style.display = 'none';
            renderWorldbookList();
            const screen = document.getElementById('worldbook-screen');
            screen.style.display = 'flex';
            setTimeout(() => screen.style.opacity = '1', 50);
        }

        function closeWorldbook() {
            const screen = document.getElementById('worldbook-screen');
            screen.style.opacity = '0';
            setTimeout(() => {
                screen.style.display = 'none';
                const home = document.getElementById('home-screen');
                home.style.display = 'flex';
                home.offsetHeight;
                home.style.opacity = '1';
            }, 300);
        }

        // --- 档案功能 ---
        let archiveProfiles = [];
        let currentArchiveTab = 'char';
        let currentArchiveEditId = null;
        let archiveFormState = {
            type: 'char',
            imageFile: null
        };

        async function initArchiveData() {
            archiveProfiles = await appDB.listArchiveProfiles();
            archiveProfiles.sort((a, b) => (b.updatedAt || b.id) - (a.updatedAt || a.id));
            renderArchiveList();
            const chatThreadsChanged = syncChatRoleThreadsWithArchiveProfiles();
            renderChatRoleThreadList();
            renderChatRolePickerList();
            renderChatRoleThreadDetail();
            if (chatThreadsChanged) await persistChatRoleThreads();
        }

        function getArchiveTypeLabel(type) {
            if (type === 'npc') return 'NPC';
            if (type === 'user') return 'USER';
            return 'CHAR';
        }

        function syncArchiveTabUI() {
            const label = getArchiveTypeLabel(currentArchiveTab);
            const meta = document.getElementById('archive-screen-meta');
            if (meta) meta.innerText = label;

            document.querySelectorAll('#archive-screen .archive-dock .dock-icon').forEach(item => {
                item.classList.toggle('active', item.dataset.tab === currentArchiveTab);
            });
        }

        function syncArchiveEditorUI() {
            const label = getArchiveTypeLabel(archiveFormState.type);
            document.getElementById('archive-editor-meta').innerText = label;
            document.getElementById('archive-preview-series').innerText = `${label} EXHIBIT`;
            updateArchiveImagePreview();
            syncArchivePreviewText();
        }

        function syncArchivePreviewText() {
            const name = document.getElementById('archive-name')?.value.trim() || '未命名角色';
            const gender = document.getElementById('archive-gender')?.value.trim() || '待补充设定';
            document.getElementById('archive-preview-name').innerText = name;
            document.getElementById('archive-preview-gender').innerText = gender;
            document.getElementById('archive-preview-status').innerText = archiveFormState.imageFile
                ? '已载入本地角色图，保存后会同步到展览卡'
                : '点击展览卡选择本地角色图';
        }

        function updateArchiveImagePreview() {
            const label = getArchiveTypeLabel(archiveFormState.type);
            setBackgroundFilePreview(
                document.getElementById('archive-image-preview'),
                archiveFormState.imageFile,
                `<div class="archive-avatar-label">${label}</div>`
            );
        }

        function openArchiveImagePicker() {
            const input = document.getElementById('archive-image-input');
            input.value = '';
            input.click();
        }

        function handleArchiveImageSelect(event) {
            const file = event.target.files[0];
            if (!file) return;
            archiveFormState.imageFile = file;
            updateArchiveImagePreview();
            syncArchivePreviewText();
            event.target.value = '';
        }

        function openArchiveApp() {
            document.getElementById('home-screen').style.display = 'none';
            syncArchiveTabUI();
            renderArchiveList();
            const screen = document.getElementById('archive-screen');
            screen.style.display = 'flex';
            setTimeout(() => screen.style.opacity = '1', 50);
        }

        function closeArchiveApp() {
            const screen = document.getElementById('archive-screen');
            screen.style.opacity = '0';
            setTimeout(() => {
                screen.style.display = 'none';
                const home = document.getElementById('home-screen');
                home.style.display = 'flex';
                home.offsetHeight;
                home.style.opacity = '1';
            }, 300);
        }

        function switchArchiveTab(tab) {
            currentArchiveTab = tab;
            syncArchiveTabUI();
            renderArchiveList();
        }

        function resetArchiveForm(type = currentArchiveTab) {
            currentArchiveEditId = null;
            archiveFormState.type = type;
            archiveFormState.imageFile = null;
            document.getElementById('archive-editor-title').innerText = '新建档案';
            document.getElementById('archive-name').value = '';
            document.getElementById('archive-gender').value = '';
            document.getElementById('archive-content').value = '';
            document.getElementById('archive-delete-entry-btn').style.display = 'none';
            syncArchiveEditorUI();
        }

        function openArchiveEditor(id = null) {
            const listScreen = document.getElementById('archive-screen');
            const editorScreen = document.getElementById('archive-editor-screen');

            if (id === null) {
                resetArchiveForm(currentArchiveTab);
            } else {
                const entry = archiveProfiles.find(item => item.id === id);
                if (!entry) return;
                currentArchiveEditId = id;
                archiveFormState.type = entry.type || currentArchiveTab;
                archiveFormState.imageFile = entry.imageFile || null;
                document.getElementById('archive-editor-title').innerText = '编辑档案';
                document.getElementById('archive-name').value = entry.name || '';
                document.getElementById('archive-gender').value = entry.gender || '';
                document.getElementById('archive-content').value = entry.content || '';
                document.getElementById('archive-delete-entry-btn').style.display = 'block';
                syncArchiveEditorUI();
            }

            listScreen.style.opacity = '0';
            setTimeout(() => {
                listScreen.style.display = 'none';
                editorScreen.style.display = 'flex';
                setTimeout(() => editorScreen.style.opacity = '1', 50);
            }, 220);
        }

        function closeArchiveEditor() {
            const listScreen = document.getElementById('archive-screen');
            const editorScreen = document.getElementById('archive-editor-screen');
            editorScreen.style.opacity = '0';
            setTimeout(() => {
                editorScreen.style.display = 'none';
                syncArchiveTabUI();
                renderArchiveList();
                listScreen.style.display = 'flex';
                setTimeout(() => listScreen.style.opacity = '1', 50);
            }, 220);
        }

        function renderArchiveList() {
            const container = document.getElementById('archive-list');
            if (!container) return;

            syncArchiveTabUI();
            const currentList = archiveProfiles.filter(item => item.type === currentArchiveTab);

            if (currentList.length === 0) {
                container.innerHTML = `<div class="archive-empty">暂无 ${getArchiveTypeLabel(currentArchiveTab)} 档案<br>点击上方 +添加 创建角色卡</div>`;
                return;
            }

            container.innerHTML = '';
            currentList.forEach(entry => {
                const card = document.createElement('div');
                const label = getArchiveTypeLabel(entry.type);
                card.className = 'archive-card';
                card.onclick = () => openArchiveEditor(entry.id);
                card.innerHTML = `
                    <div class="archive-card-pin"></div>
                    <div class="archive-card-copy">
                        <div class="archive-card-top">
                            <div>
                                <div class="archive-card-name">${escapeHtml(entry.name || '未命名')}</div>
                                <div class="archive-card-gender">${escapeHtml(entry.gender || '未设定')}</div>
                            </div>
                            <div class="archive-type-pill">${label}</div>
                        </div>
                        <div class="archive-card-content">${escapeHtml(entry.content || '')}</div>
                        <div class="archive-card-footer">
                            <div class="archive-card-series">${label} EXHIBIT CARD</div>
                            <div class="archive-card-updated">${formatArchiveDate(entry.updatedAt)}</div>
                        </div>
                    </div>
                `;

                const visual = document.createElement('div');
                visual.className = 'archive-card-visual';
                setBackgroundFilePreview(visual, entry.imageFile, `<span class="archive-card-visual-label">${label}</span>`);
                card.insertBefore(visual, card.querySelector('.archive-card-copy'));
                card.style.width = 'calc(100% - 10px)';
                card.style.maxWidth = 'calc(100% - 10px)';
                container.appendChild(card);
            });
        }

        async function saveArchiveProfile() {
            const name = document.getElementById('archive-name').value.trim();
            const gender = document.getElementById('archive-gender').value.trim();
            const content = document.getElementById('archive-content').value.trim();

            if (!name) {
                alert('请输入姓名');
                return;
            }
            if (!gender) {
                alert('请输入性别');
                return;
            }
            if (!content) {
                alert('请输入设定内容');
                return;
            }

            const entry = {
                id: currentArchiveEditId || Date.now(),
                type: archiveFormState.type,
                name,
                gender,
                content,
                imageFile: archiveFormState.imageFile || null,
                updatedAt: Date.now()
            };

            await appDB.upsertArchiveProfile(entry);
            currentArchiveTab = archiveFormState.type;
            await initArchiveData();
            closeArchiveEditor();
        }

        async function deleteCurrentArchiveProfile() {
            if (!currentArchiveEditId) return;
            if (!confirm('确认删除这个档案吗？')) return;
            await appDB.deleteArchiveProfile(currentArchiveEditId);
            currentArchiveEditId = null;
            await initArchiveData();
            closeArchiveEditor();
        }

        function resetWorldbookForm() {
            currentWorldbookEditId = null;
            document.getElementById('worldbook-editor-title').innerText = '新建条目';
            document.getElementById('worldbook-title').value = '';
            document.getElementById('worldbook-keywords').value = '';
            document.getElementById('worldbook-content').value = '';
            document.getElementById('worldbook-delete-entry-btn').style.display = 'none';
            setWorldbookOption('scope', 'global');
            setWorldbookOption('triggerMode', 'always');
            setWorldbookOption('injectPosition', 'before');
        }

        function openWorldbookEditor(id = null) {
            const listScreen = document.getElementById('worldbook-screen');
            const editorScreen = document.getElementById('worldbook-editor-screen');

            if (id === null) {
                resetWorldbookForm();
            } else {
                const entry = worldbookList.find(item => item.id === id);
                if (!entry) return;
                currentWorldbookEditId = id;
                document.getElementById('worldbook-editor-title').innerText = '编辑条目';
                document.getElementById('worldbook-title').value = entry.title || '';
                document.getElementById('worldbook-keywords').value = (entry.keywords || []).join(', ');
                document.getElementById('worldbook-content').value = entry.content || '';
                document.getElementById('worldbook-delete-entry-btn').style.display = 'block';
                setWorldbookOption('scope', entry.scope || 'global');
                setWorldbookOption('triggerMode', entry.triggerMode || 'always');
                setWorldbookOption('injectPosition', entry.injectPosition || 'before');
            }

            listScreen.style.opacity = '0';
            setTimeout(() => {
                listScreen.style.display = 'none';
                editorScreen.style.display = 'flex';
                setTimeout(() => editorScreen.style.opacity = '1', 50);
            }, 220);
        }

        function closeWorldbookEditor() {
            const listScreen = document.getElementById('worldbook-screen');
            const editorScreen = document.getElementById('worldbook-editor-screen');
            editorScreen.style.opacity = '0';
            setTimeout(() => {
                editorScreen.style.display = 'none';
                listScreen.style.display = 'flex';
                setTimeout(() => listScreen.style.opacity = '1', 50);
            }, 220);
        }

        function setWorldbookOption(group, value) {
            worldbookFormState[group] = value;
            document.querySelectorAll(`.worldbook-option[data-group="${group}"]`).forEach(option => {
                option.classList.toggle('active', option.dataset.value === value);
            });

            if (group === 'triggerMode') {
                document.getElementById('worldbook-keywords-field').style.display = value === 'keyword' ? 'block' : 'none';
            }
        }

        function getWorldbookScopeLabel(scope) {
            return scope === 'character' ? '角色' : '全局';
        }

        function getWorldbookTriggerLabel(triggerMode) {
            return triggerMode === 'keyword' ? '关键词生效' : '始终生效';
        }

        function getWorldbookInjectLabel(injectPosition) {
            if (injectPosition === 'middle') return '中';
            if (injectPosition === 'after') return '后';
            return '前';
        }

        function escapeHtml(text = '') {
            return String(text)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#39;');
        }

        function renderWorldbookList() {
            const container = document.getElementById('worldbook-list');
            if (!container) return;

            if (worldbookList.length === 0) {
                container.innerHTML = '<div class="worldbook-empty">还没有世界书条目<br>点击右上角 + 新建一个条目</div>';
                return;
            }

            container.innerHTML = '';
            worldbookList.forEach(entry => {
                const card = document.createElement('div');
                const keywordsText = entry.triggerMode === 'keyword' && entry.keywords && entry.keywords.length > 0
                    ? `<span class="worldbook-tag">${escapeHtml(entry.keywords.join(' / '))}</span>`
                    : '';

                card.className = 'worldbook-card';
                card.onclick = () => openWorldbookEditor(entry.id);
                card.innerHTML = `
                    <div class="worldbook-card-top">
                        <div class="worldbook-card-main">
                            <div class="worldbook-card-title">${escapeHtml(entry.title || '未命名条目')}</div>
                            <div class="worldbook-meta">
                                <span class="worldbook-tag">${getWorldbookScopeLabel(entry.scope)}</span>
                                <span class="worldbook-tag">${getWorldbookTriggerLabel(entry.triggerMode)}</span>
                                <span class="worldbook-tag">注入${getWorldbookInjectLabel(entry.injectPosition)}</span>
                                ${keywordsText}
                            </div>
                        </div>
                        <div class="action-btn" onclick="deleteWorldbookEntry(${entry.id}, event)"><i data-feather="trash-2" width="16" height="16"></i></div>
                    </div>
                    <div class="worldbook-preview">${escapeHtml(entry.content || '')}</div>
                `;
                container.appendChild(card);
            });

            feather.replace({ 'stroke-width': 1.2 });
        }

        async function saveWorldbookEntry() {
            const title = document.getElementById('worldbook-title').value.trim();
            const keywordsRaw = document.getElementById('worldbook-keywords').value.trim();
            const content = document.getElementById('worldbook-content').value.trim();

            if (!title) {
                alert('请输入词条标题');
                return;
            }
            if (worldbookFormState.triggerMode === 'keyword' && !keywordsRaw) {
                alert('请选择关键词生效后输入关键词');
                return;
            }
            if (!content) {
                alert('请输入设定内容');
                return;
            }

            const entry = {
                id: currentWorldbookEditId || Date.now(),
                title,
                scope: worldbookFormState.scope,
                triggerMode: worldbookFormState.triggerMode,
                keywords: worldbookFormState.triggerMode === 'keyword'
                    ? keywordsRaw.split(/[，,]/).map(item => item.trim()).filter(Boolean)
                    : [],
                injectPosition: worldbookFormState.injectPosition,
                content,
                updatedAt: Date.now()
            };

            await appDB.upsertWorldbook(entry);
            await initWorldbookData();
            closeWorldbookEditor();
        }

        async function deleteWorldbookEntry(id, event) {
            if (event) event.stopPropagation();
            if (!confirm('确认删除这个世界书条目吗？')) return;
            await appDB.deleteWorldbook(id);
            if (currentWorldbookEditId === id) currentWorldbookEditId = null;
            await initWorldbookData();
        }

        async function deleteCurrentWorldbookEntry() {
            if (!currentWorldbookEditId) return;
            if (!confirm('确认删除这个世界书条目吗？')) return;
            await appDB.deleteWorldbook(currentWorldbookEditId);
            currentWorldbookEditId = null;
            await initWorldbookData();
            closeWorldbookEditor();
        }

        // --- 核心播放逻辑 ---
        let musicList = [];
        let currentMusicId = null;
        let isPlaying = false;
        const audioPlayer = document.getElementById('audio-player');
        
        // 进度条平滑无圆点
        audioPlayer.addEventListener('timeupdate', () => {
            const progress = document.getElementById('widget-progress');
            if (audioPlayer.duration) {
                const percent = (audioPlayer.currentTime / audioPlayer.duration) * 100;
                progress.style.width = `${percent}%`;
            } else { progress.style.width = '0%'; }
        });
        audioPlayer.addEventListener('ended', () => {
            isPlaying = false; document.getElementById('widget-progress').style.width = '0%';
            updateWidgetUI(); renderMusicList();
        });

        async function initMusicData() {
            // 只拉取真实数据，去掉不合理的强制塞默认逻辑
            musicList = await appDB.listMusic();
            if (!musicList.some(item => item.id === currentMusicId)) {
                if(audioPlayer.src && audioPlayer.src.startsWith('blob:')) URL.revokeObjectURL(audioPlayer.src);
                audioPlayer.pause();
                audioPlayer.removeAttribute('src');
                audioPlayer.load();
                currentMusicId = null;
                isPlaying = false;
                document.getElementById('widget-progress').style.width = '0%';
            }
            updateWidgetUI();
        }

        let tempAudioFile = null;
        let tempImageFile = null;

        function handleFileSelect(event, type) {
            const file = event.target.files[0];
            if (file) {
                if (type === 'audio') {
                    document.getElementById('add-url').value = `本地导入: ${file.name}`;
                    tempAudioFile = file;
                } else if (type === 'image') {
                    document.getElementById('add-cover').value = `本地图片: ${file.name}`;
                    tempImageFile = file;
                }
            }
        }

        async function saveMusic() {
            const title = document.getElementById('add-title').value.trim() || '未命名';
            const singer = document.getElementById('add-singer').value.trim() || '未知歌手';
            let url = document.getElementById('add-url').value.trim();
            let cover = document.getElementById('add-cover').value.trim();
            
            let musicObj = { id: Date.now(), title, singer, url: tempAudioFile ? 'local' : url, cover: tempImageFile ? 'local' : cover };
            if (tempAudioFile) musicObj.file = tempAudioFile;
            if (tempImageFile) musicObj.coverFile = tempImageFile;
            
            await appDB.upsertMusic(musicObj);
            musicList = await appDB.listMusic();
            tempAudioFile = null; tempImageFile = null;
            
            closeAddMusicModal(null); updateWidgetUI(); openMusicListModal();
        }

        async function deleteMusic(id, event) {
            event.stopPropagation();
            await appDB.deleteMusic(id);
            musicList = await appDB.listMusic();
            if (currentMusicId === id) {
                audioPlayer.pause(); isPlaying = false; currentMusicId = null;
                document.getElementById('widget-progress').style.width = '0%';
            }
            updateWidgetUI(); renderMusicList();
        }

        // --- 弹窗与渲染 ---
        function openMusicListModal() { renderMusicList(); toggleModal('music-list-modal', true); }
        function closeMusicListModal(e) { if(e && e.target !== e.currentTarget) return; toggleModal('music-list-modal', false); }
        function openAddMusicModal() {
            closeMusicListModal(null);
            document.getElementById('add-title').value = ''; document.getElementById('add-singer').value = '';
            document.getElementById('add-url').value = ''; document.getElementById('add-cover').value = '';
            tempAudioFile = null; tempImageFile = null;
            toggleModal('add-music-modal', true);
        }
        function closeAddMusicModal(e) { if(e && e.target !== e.currentTarget) return; toggleModal('add-music-modal', false); }
        
        function toggleModal(id, show) {
            const m = document.getElementById(id);
            if (!m) return;

            if (m._hideTimer) {
                clearTimeout(m._hideTimer);
                m._hideTimer = null;
            }

            if(show) {
                m.style.display = 'flex';
                m.offsetHeight;
                m.style.opacity = '1';
                m.classList.add('show');
                return;
            }

            m.style.opacity = '0';
            m.classList.remove('show');
            m._hideTimer = setTimeout(() => {
                m.style.display = 'none';
                m._hideTimer = null;
            }, 300);
        }

        function renderMusicList() {
            const container = document.getElementById('music-list-container');
            container.innerHTML = musicList.length === 0 ? `<div style="text-align:center; padding: 20px; color: var(--accent-color);">暂无音乐，快去添加吧</div>` : '';
            
            musicList.forEach(music => {
                const item = document.createElement('div');
                const isActive = currentMusicId === music.id && isPlaying;
                item.className = `music-list-item ${isActive ? 'playing' : ''}`;
                item.onclick = () => playMusic(music.id);
                
                let playIcon = isActive ? `<i data-feather="pause-circle" color="var(--accent-color)"></i>` : `<i data-feather="play-circle" color="var(--accent-color)"></i>`;
                let displayCover = music.coverFile ? URL.createObjectURL(music.coverFile) : music.cover;
                let coverHtml = (displayCover && displayCover !== 'local') ? `<div class="item-cover" style="background-image: url('${displayCover}')"></div>` : `<div class="item-cover"><i data-feather="music" color="var(--text-color)"></i></div>`;
                
                item.innerHTML = `
                    <div style="min-width: 24px;">${playIcon}</div>
                    ${coverHtml}
                    <div class="item-info">
                        <div class="item-title">${music.title}</div>
                        <div class="item-singer">${music.singer}</div>
                    </div>
                    <div class="item-actions">
                        <div class="action-btn" onclick="deleteMusic(${music.id}, event)"><i data-feather="trash-2" width="16" height="16"></i></div>
                    </div>
                `;
                container.appendChild(item);
            });
            feather.replace({ 'stroke-width': 1.2 });
        }

        function playMusic(id) {
            const music = musicList.find(m => m.id === id);
            if (!music) return;
            
            if (currentMusicId === id) {
                if (isPlaying) { audioPlayer.pause(); isPlaying = false; } 
                else if (audioPlayer.src) { audioPlayer.play(); isPlaying = true; }
            } else {
                currentMusicId = id;
                if(audioPlayer.src && audioPlayer.src.startsWith('blob:')) URL.revokeObjectURL(audioPlayer.src); // 防内存泄露
                
                let playUrl = music.file ? URL.createObjectURL(music.file) : music.url;
                if (playUrl && playUrl !== 'local') {
                    audioPlayer.src = playUrl; audioPlayer.play().catch(e=>console.log(e)); isPlaying = true;
                } else isPlaying = false;
            }
            updateWidgetUI(); if(document.getElementById('music-list-modal').classList.contains('show')) renderMusicList();
        }

        function togglePlay(event) {
            event.stopPropagation();
            if (currentMusicId) playMusic(currentMusicId);
            else if (musicList.length > 0) playMusic(musicList[0].id);
        }

        function updateWidgetUI() {
            let music = musicList.find(m => m.id === currentMusicId) || (musicList.length > 0 ? musicList[0] : null);
            const cover = document.getElementById('widget-cover');
            
            if (music) {
                document.getElementById('widget-title').innerText = music.title;
                document.getElementById('widget-singer').innerText = music.singer;
                let displayCover = music.coverFile ? URL.createObjectURL(music.coverFile) : music.cover;
                if (displayCover && displayCover !== 'local') {
                    cover.style.backgroundImage = `url('${displayCover}')`; cover.innerHTML = '';
                } else {
                    cover.style.backgroundImage = 'none'; cover.innerHTML = '<i data-feather="music" width="24" height="24" color="var(--accent-color)" id="widget-default-icon"></i>';
                }
            } else {
                document.getElementById('widget-title').innerText = "暂无歌曲";
                document.getElementById('widget-singer').innerText = "点击添加";
                cover.style.backgroundImage = 'none';
                cover.innerHTML = '<i data-feather="music" width="24" height="24" color="var(--accent-color)" id="widget-default-icon"></i>';
            }
            
            document.getElementById('widget-play-btn').innerHTML = isPlaying ? '<i data-feather="pause-circle" width="32" height="32"></i>' : '<i data-feather="play-circle" width="32" height="32"></i>';
            feather.replace({ 'stroke-width': 1.2 });
        }

        function openScreenFromHashRoute() {
            const route = String(window.location.hash || '').replace(/^#/, '').trim().toLowerCase();
            const openers = {
                chat: openChatApp,
                settings: openSettings,
                forum: openForum,
                archive: openArchiveApp,
                worldbook: openWorldbook
            };
            const openTarget = openers[route];

            if (!openTarget) return;

            const pureLockScreen = document.getElementById('pure-lock-screen');
            if (pureLockScreen) {
                pureLockScreen.style.display = 'none';
                pureLockScreen.style.opacity = '0';
            }

            unlock(true);
            setTimeout(() => openTarget(), 120);
        }

        function bindApiSettingsDraftInputs() {
            [
                'api-chat-preset-name',
                'api-chat-api-key',
                'api-chat-context-count'
            ].forEach(id => {
                document.getElementById(id)?.addEventListener('input', handleApiChatDraftInput);
            });

            [
                'api-voice-preset-name',
                'api-voice-api-key',
                'api-voice-group-id',
                'api-voice-language'
            ].forEach(id => {
                document.getElementById(id)?.addEventListener('input', handleApiVoiceDraftInput);
            });
        }

        function flushPendingApiSettingsDrafts() {
            if (apiChatDraftPersistTimer) {
                clearTimeout(apiChatDraftPersistTimer);
                apiChatDraftPersistTimer = null;
                persistApiChatDraftState();
            }

            if (apiVoiceDraftPersistTimer) {
                clearTimeout(apiVoiceDraftPersistTimer);
                apiVoiceDraftPersistTimer = null;
                persistApiVoiceDraftState();
            }
        }

        function shouldRegisterServiceWorker() {
            if (!('serviceWorker' in navigator)) return false;
            if (window.location.protocol === 'https:') return true;
            return ['localhost', '127.0.0.1'].includes(window.location.hostname);
        }

        function registerAppServiceWorker() {
            if (!shouldRegisterServiceWorker()) return;
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('./sw.js').catch(() => {
                    // deployment metadata should never block app startup
                });
            });
        }

        bindApiSettingsDraftInputs();
        window.addEventListener('pagehide', flushPendingApiSettingsDrafts);
        registerAppServiceWorker();

        window.addEventListener('load', () => {
            if (!window.location.hash) return;
            setTimeout(openScreenFromHashRoute, 80);
        });

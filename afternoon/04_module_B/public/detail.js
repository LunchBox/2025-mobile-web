const { createApp } = Vue;

createApp({
    data() {
        return {
            // Language settings
            currentLang: 'zh',
            lang: {
                zh: {
                    courseDetail: '課程詳情',
                    loading: '載入中...',
                    errorTitle: '找不到課程',
                    successTitleTrial: '成功預約',
                    backToList: '返回課程列表',
                    courseCode: '課程編號',
                    objective: '課程目標',
                    content: '課程內容',
                    assessment: '評核方式',
                    assessmentDefault: '根據課程要求進行評核，包括出席率、課堂表現、作業完成情況等。',
                    targetAudience: '適合報讀人士',
                    targetAudienceDefault: '對本課程主題有興趣的人士均可報讀。',
                    prerequisites: '修讀條件',
                    prerequisitesDefault: '無特別要求，歡迎有興趣人士報讀。',
                    remark: '備註',
                    courseInfo: '課程資訊',
                    schedule: '上課時間',
                    detailedSchedule: '詳細時間',
                    to: '至',
                    duration: '課程時數',
                    courseHours: '課程學時',
                    teachingLanguage: '講課語言',
                    teachingLanguageDefault: '粵語輔以普通話',
                    materialLanguage: '派發資料語言',
                    materialLanguageDefault: '中文',
                    location: '上課地點',
                    locationDefault: '澳門生產力暨科技轉移中心',
                    certificate: '證書',
                    certificateDefault: '出席率達80%或以上可獲發證書',
                    instructor: '導師介紹',
                    instructorDefault: '由經驗豐富的專業導師授課',
                    fee: '學費',
                    seats: '名額',
                    notAvailable: '待定',
                    enrollNow: '立即報名',
                    favorite: '收藏課程',
                    relatedCourses: '相關課程推薦',
                    // Enrollment form
                    step1: '選擇課程',
                    step2: '填寫資料',
                    step3: '確認資訊',
                    cancel: '取消',
                    next: '下一步',
                    back: '上一步',
                    submit: '提交報名',
                    name: '姓名',
                    gender: '性別',
                    male: '男',
                    female: '女',
                    birthDate: '出生日期',
                    phone: '電話',
                    email: '電郵',
                    courseName: '課程名稱',
                    successTitle: '報名提交成功！',
                    successMessage: '我們會盡快與您聯繫',
                    successMessageTrial: '您的試聽已成功預約，我們會與您聯繫以確認時間',
                    close: '關閉',
                    nameRequired: '姓名不能為空',
                    genderRequired: '請選擇性別',
                    birthDateRequired: '出生日期不能為空',
                    phoneRequired: '電話不能為空',
                    weeks: '週'
                },
                en: {
                    courseDetail: 'Course Details',
                    loading: 'Loading...',
                    errorTitle: 'Course Not Found',
                    successTitleTrial: 'Reservation Successful',
                    backToList: 'Back to Course List',
                    courseCode: 'Course Code',
                    objective: 'Course Objective',
                    content: 'Course Content',
                    assessment: 'Assessment Method',
                    assessmentDefault: 'Assessment based on course requirements, including attendance, class performance, and assignment completion.',
                    targetAudience: 'Target Audience',
                    targetAudienceDefault: 'Anyone interested in this course topic is welcome to enroll.',
                    prerequisites: 'Prerequisites',
                    prerequisitesDefault: 'No special requirements. All interested individuals are welcome.',
                    remark: 'Remarks',
                    courseInfo: 'Course Information',
                    schedule: 'Schedule',
                    detailedSchedule: 'Detailed Timetable',
                    to: 'to',
                    duration: 'Duration',
                    courseHours: 'Course Hours',
                    teachingLanguage: 'Teaching Language',
                    teachingLanguageDefault: 'Cantonese supplemented with Mandarin',
                    materialLanguage: 'Material Language',
                    materialLanguageDefault: 'Chinese',
                    location: 'Location',
                    locationDefault: 'CPTTM Macao',
                    certificate: 'Certificate',
                    certificateDefault: 'Certificate awarded for 80% or above attendance',
                    instructor: 'Instructor',
                    instructorDefault: 'Taught by experienced professional instructors',
                    fee: 'Fee',
                    seats: 'Seats',
                    notAvailable: 'TBD',
                    enrollNow: 'Enroll Now',
                    favorite: 'Add to Favorites',
                    relatedCourses: 'Related Courses',
                    // Enrollment form
                    step1: 'Select Course',
                    step2: 'Fill Information',
                    step3: 'Confirm',
                    cancel: 'Cancel',
                    next: 'Next',
                    back: 'Back',
                    submit: 'Submit',
                    name: 'Name',
                    gender: 'Gender',
                    male: 'Male',
                    female: 'Female',
                    birthDate: 'Birth Date',
                    phone: 'Phone',
                    email: 'Email',
                    courseName: 'Course Name',
                    successTitle: 'Enrollment Submitted!',
                    successMessage: 'We will contact you soon',
                    successMessageTrial: 'Your trial reservation has been submitted. We will contact you to confirm the time.',
                    close: 'Close',
                    nameRequired: 'Name is required',
                    genderRequired: 'Please select gender',
                    birthDateRequired: 'Birth date is required',
                    phoneRequired: 'Phone is required',
                    weeks: 'weeks'
                }
            },
            
            // Course data
            course: null,
            allCourses: [],
            relatedCourses: [],
            loading: true,
            error: null,
            
            // Favorite
            isFavorite: false,
            
            // Enrollment
            showEnrollment: false,
            enrollmentStep: 1,
            formData: {
                name: '',
                gender: '',
                birthDate: '',
                phone: '',
                email: ''
            },
            errors: {},
            showSuccess: false
        };
    },
    
    methods: {
        // Language toggle
        toggleLanguage() {
            this.currentLang = this.currentLang === 'zh' ? 'en' : 'zh';
        },
        
        // Get course ID from URL
        getCourseIdFromUrl() {
            const params = new URLSearchParams(window.location.search);
            return params.get('id');
        },
        
        // Load course data
        async loadCourseData() {
            const courseId = this.getCourseIdFromUrl();
            
            if (!courseId) {
                this.error = this.lang[this.currentLang].errorTitle;
                this.loading = false;
                return;
            }
            
            try {
                // Try to load from all page files
                let found = false;
                for (let page = 1; page <= 7; page++) {
                    const paths = [`data/page-${page}.json`, `data/page${page}.json`];
                    
                    for (const path of paths) {
                        try {
                            const response = await fetch(path);
                            if (response.ok) {
                                const data = await response.json();
                                const courses = data.courses || data || [];
                                
                                // Store all courses for related courses feature
                                this.allCourses = this.allCourses.concat(courses);
                                
                                // Find the specific course
                                const course = courses.find(c => 
                                    (c.course_code || c.courseCode || c.id) === courseId
                                );
                                
                                if (course) {
                                    this.course = course;
                                    found = true;
                                    break;
                                }
                            }
                        } catch (e) {
                            // Continue to next file
                        }
                    }
                    
                    if (found) break;
                }
                
                if (!found) {
                    this.error = this.lang[this.currentLang].errorTitle;
                } else {
                    // Load related courses
                    this.loadRelatedCourses();
                    // Check if course is in favorites
                    this.checkFavorite();
                }
            } catch (error) {
                console.error('Error loading course:', error);
                this.error = this.lang[this.currentLang].errorTitle;
            } finally {
                this.loading = false;
            }
        },
        
        // Load related courses (Extra Feature)
        loadRelatedCourses() {
            if (!this.course) return;
            
            // Get course code prefix (e.g., "CM" from "CM540-01-2025-C")
            const courseCode = this.course.course_code || this.course.courseCode || '';
            const prefix = courseCode.split(/[-_.]/)[0] || '';
            
            // Find courses with same prefix (same category)
            this.relatedCourses = this.allCourses
                .filter(c => {
                    const code = c.course_code || c.courseCode || '';
                    const cPrefix = code.split(/[-_.]/)[0] || '';
                    return cPrefix === prefix && code !== courseCode;
                })
                .slice(0, 3); // Show max 3 related courses
        },
        
        // Get course name based on language
        getCourseName(course) {
            if (!course) return '';
            return this.currentLang === 'zh' 
                ? (course.c_title || course.title || course.name || '')
                : (course.e_title || course.title || course.name || '');
        },
        
        // Get course objective
        getCourseObjective(course) {
            if (!course) return '';
            return this.currentLang === 'zh'
                ? (course.c_objective || '')
                : (course.e_objective || '');
        },
        
        // Get course content
        getCourseContent(course) {
            if (!course) return '';
            return this.currentLang === 'zh'
                ? (course.c_content || '')
                : (course.e_content || '');
        },
        
        // Get course remark
        getCourseRemark(course) {
            if (!course) return '';
            return this.currentLang === 'zh'
                ? (course.c_remark || '')
                : (course.e_remark || '');
        },
        
        // Get course price
        getCoursePrice(course) {
            if (!course) return 'N/A';
            if (course.fees && course.fees[0] && course.fees[0].fee) {
                return `MOP ${course.fees[0].fee}`;
            }
            return course.price || 'N/A';
        },
        
        // Get course image
        getCourseImage(course) {
            if (!course) return 'images/default.png';
            
            const courseCode = course.course_code || course.courseCode || course.id || '';
            const prefix = courseCode.split(/[-_.]/)[0] || '';
            
            if (course.image) {
                if (/^(https?:)?\/\//i.test(course.image) || course.image.startsWith('/')) {
                    return course.image;
                }
                return `images/${course.image}`;
            }
            
            if (prefix) {
                return `images/${prefix}.png`;
            }
            
            return 'images/default.png';
        },
        
        // Handle image error
        handleImageError(event) {
            const current = event.target.getAttribute('src') || '';
            if (!current.includes('default.png')) {
                event.target.src = 'images/default.png';
            }
        },
        
        // Calculate duration between two dates
        calculateDuration(startDate, endDate) {
            if (!startDate || !endDate) return this.lang[this.currentLang].notAvailable;
            
            try {
                const start = new Date(startDate);
                const end = new Date(endDate);
                const diffTime = Math.abs(end - start);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                const weeks = Math.ceil(diffDays / 7);
                
                return `${weeks} ${this.lang[this.currentLang].weeks}`;
            } catch (e) {
                return this.lang[this.currentLang].notAvailable;
            }
        },
        
        // Toggle favorite
        toggleFavorite() {
            this.isFavorite = !this.isFavorite;
            
            // Save to localStorage
            const favorites = this.getFavorites();
            const courseId = this.course.course_code || this.course.courseCode || this.course.id;
            
            if (this.isFavorite) {
                if (!favorites.includes(courseId)) {
                    favorites.push(courseId);
                }
            } else {
                const index = favorites.indexOf(courseId);
                if (index > -1) {
                    favorites.splice(index, 1);
                }
            }
            
            localStorage.setItem('favoriteCourses', JSON.stringify(favorites));
        },
        
        // Check if course is favorite
        checkFavorite() {
            const favorites = this.getFavorites();
            const courseId = this.course.course_code || this.course.courseCode || this.course.id;
            this.isFavorite = favorites.includes(courseId);
        },
        
        // Get favorites from localStorage
        getFavorites() {
            try {
                const stored = localStorage.getItem('favoriteCourses');
                return stored ? JSON.parse(stored) : [];
            } catch (e) {
                return [];
            }
        },
        
        // Enrollment process
        startEnrollment() {
            this.showEnrollment = true;
            this.enrollmentStep = 1;
            this.resetForm();
        },
        
        closeEnrollment() {
            this.showEnrollment = false;
            this.resetForm();
        },
        
        resetForm() {
            this.formData = {
                name: '',
                gender: '',
                birthDate: '',
                phone: '',
                email: ''
            };
            this.errors = {};
        },
        
        validateForm() {
            this.errors = {};
            
            if (!this.formData.name.trim()) {
                this.errors.name = this.lang[this.currentLang].nameRequired;
            }
            
            if (!this.formData.gender) {
                this.errors.gender = this.lang[this.currentLang].genderRequired;
            }
            
            if (!this.formData.birthDate) {
                this.errors.birthDate = this.lang[this.currentLang].birthDateRequired;
            }
            
            if (!this.formData.phone.trim()) {
                this.errors.phone = this.lang[this.currentLang].phoneRequired;
            }
            
            if (Object.keys(this.errors).length === 0) {
                this.enrollmentStep = 3;
            }
        },
        
        submitEnrollment() {
            console.log('Enrollment submitted:', {
                course: this.course,
                formData: this.formData
            });
            
            this.showEnrollment = false;
            this.showSuccess = true;
            this.resetForm();
        },

        // Handle trial listen form submission (in public/detail.html)
        handleTrialSubmit(event) {
            // Collect basic form fields (non-vue form)
            try {
                const form = document.getElementById('trialForm');
                const formData = new FormData(form);
                const name = formData.get('name') || '';
                const phone = formData.get('phone') || '';
                const email = formData.get('email') || '';
                const date = formData.get('date') || '';

                console.log('Trial reservation submitted:', { name, phone, email, date, course: this.course });

                // Show success modal with trial-specific message
                this.showSuccess = true;

                // Replace success title/message based on language
                if (this.currentLang === 'zh') {
                    this.lang.zh.successTitle = this.lang.zh.successTitleTrial || this.lang.zh.successTitle;
                    this.lang.zh.successMessage = this.lang.zh.successMessageTrial || this.lang.zh.successMessage;
                } else {
                    this.lang.en.successTitle = this.lang.en.successTitleTrial || this.lang.en.successTitle;
                    this.lang.en.successMessage = this.lang.en.successMessageTrial || this.lang.en.successMessage;
                }

                // Optionally reset the native form
                form.reset();
            } catch (e) {
                console.error('Error handling trial submit', e);
            }
        },
        
        closeSuccess() {
            this.showSuccess = false;
        }
    },
    
    mounted() {
        this.loadCourseData();
    }
}).mount('#app');

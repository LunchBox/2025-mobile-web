const { createApp } = Vue;

createApp({
    data() {
        return {
            // Language settings
            currentLang: 'zh',
            lang: {
                zh: {
                    title: '課程列表',
                    subtitle: '探索澳門生產力暨科技轉移中心的精彩課程',
                    gridView: '卡片',
                    listView: '清單',
                    sortByDefault: '排序方式',
                    sortByDate: '按開課日期排序',
                    sortByPrice: '按價格排序',
                    searchPlaceholder: '搜索課程名 / 編號',
                    clear: '清除',
                    courseCode: '課程編號',
                    startDate: '開課日期',
                    seats: '名額',
                    enroll: '立即報名',
                    prevPage: '上一頁',
                    nextPage: '下一頁',
                    noResults: '未找到相關課程',
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
                    close: '關閉',
                    nameRequired: '姓名不能為空',
                    genderRequired: '請選擇性別',
                    birthDateRequired: '出生日期不能為空',
                    phoneRequired: '電話不能為空'
                },
                en: {
                    title: 'Course List',
                    subtitle: 'Explore exciting courses from CPTTM',
                    gridView: 'Grid',
                    listView: 'List',
                    sortByDefault: 'Sort By',
                    sortByDate: 'Sort by Start Date',
                    sortByPrice: 'Sort by Price',
                    searchPlaceholder: 'Search course name / code',
                    clear: 'Clear',
                    courseCode: 'Course Code',
                    startDate: 'Start Date',
                    seats: 'Seats',
                    enroll: 'Enroll Now',
                    prevPage: 'Previous',
                    nextPage: 'Next',
                    noResults: 'No courses found',
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
                    close: 'Close',
                    nameRequired: 'Name is required',
                    genderRequired: 'Please select gender',
                    birthDateRequired: 'Birth date is required',
                    phoneRequired: 'Phone is required'
                }
            },
            
            // View settings
            viewMode: 'grid', // 'grid' or 'list'
            
            // Sort & Search
            sortBy: '',
            searchQuery: '',
            
            // Pagination
            currentPage: 1,
            itemsPerPage: 9,
            
            // Course data
            allCourses: [],
            filteredCourses: [],
            
            // Enrollment
            showEnrollment: false,
            enrollmentStep: 1,
            selectedCourse: {},
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
    
    computed: {
        displayedCourses() {
            const start = (this.currentPage - 1) * this.itemsPerPage;
            const end = start + this.itemsPerPage;
            return this.filteredCourses.slice(start, end);
        },
        
        totalPages() {
            return Math.ceil(this.filteredCourses.length / this.itemsPerPage);
        }
    },
    
    methods: {
        // Language toggle
        toggleLanguage() {
            this.currentLang = this.currentLang === 'zh' ? 'en' : 'zh';
        },
        
        // Load courses from data for a specific page number.
        // Will try 'data/page-{n}.json' first, then 'data/page{n}.json'.
        async loadCourses(pageNumber = 1) {
            this.allCourses = [];
            this.filteredCourses = [];
            const candidates = [
                `data/page-${pageNumber}.json`,
                `data/page${pageNumber}.json`,
                `data/page1.json`
            ];
            for (const path of candidates) {
                try {
                    const resp = await fetch(path);
                    if (resp.ok) {
                        const data = await resp.json();
                        const raw = data.courses || data || [];

                        // Normalize fields so templates can rely on consistent keys.
                        this.allCourses = raw.map(c => {
                            // id/course code
                            const code = c.course_code || c.courseCode || c.id || '';
                            // name: prefer Chinese title if present, otherwise English title
                            const name = c.c_title || c.e_title || c.title || '';
                            // price: extract first fee if available
                            const priceValue = (c.fees && c.fees[0] && Number(c.fees[0].fee)) || 0;
                            const price = priceValue ? `MOP ${priceValue}` : '';
                            // start date and seats
                            const startDate = c.start_date || c.startDate || '';
                            const seats = c.size || c.seats || '';
                            // infer image name from course code prefix if JSON doesn't provide explicit image
                            const prefix = (code || '').split(/[-_.]/)[0] || '';
                            // Use provided image; if none, prefer prefix.png; otherwise use a transparent 1x1 so no default logo shows
                            const image = c.image || (prefix ? `${prefix}.png` : 'data:image/gif;base64,R0lGODlhAQABAIAAAAUEBA==');

                            return Object.assign({}, c, {
                                id: code,
                                name,
                                priceValue,
                                price,
                                startDate,
                                seats,
                                image
                            });
                        });

                        this.filteredCourses = [...this.allCourses];
                        this.currentPage = pageNumber;
                        console.info('Loaded courses for page', pageNumber, 'count=', this.allCourses.length, this.allCourses[0] || null);
                        return;
                    }
                } catch (e) {
                    // try next candidate
                }
            }
            // If none found, leave lists empty and log a warning. No sample fallback.
            console.warn('No data file found for page', pageNumber, 'looked for', candidates);
        },
        
        // NOTE: sample data removed. The app strictly uses JSON files under /data.
        
        // Get course image path: use image field if present. If it's a filename, prefix with images/;
        // if it's an absolute path or URL, use as-is. If none, return project default image.
        getCourseImage(courseOrId) {
            if (courseOrId && typeof courseOrId === 'object') {
                const course = courseOrId;
                if (course.image) {
                    const img = course.image;
                    // If image is absolute or starts with '/', use it directly
                    if (/^(https?:)?\/\//i.test(img) || img.startsWith('/')) return img;
                    return `images/${img}`;
                }
            }
            // Use real default image file so browsers display it instead of alt text
            return 'images/default.png';
        },

        // Handle image error (use default image). Prevent infinite loop by checking current src.
        handleImageError(event) {
            try {
                const current = event.target.getAttribute('src') || '';
                if (!current.includes('default.png') && !current.includes('default.jpg')) {
                    // If it failed to load a .jpg, try .png next (many assets are PNGs)
                    if (current.endsWith('.jpg')) {
                        const png = current.replace(/\.jpg$/, '.png');
                        event.target.src = png;
                        return;
                    }
                    // Fall back to the project's default image so the card shows a valid picture
                    event.target.src = 'images/default.png';
                }
            } catch (e) {
                // If anything goes wrong, fall back to default image
                event.target.src = 'images/default.png';
            }
        },
        
        // Sort courses
        sortCourses() {
            if (this.sortBy === 'date') {
                this.filteredCourses.sort((a, b) => {
                    const dateA = new Date(a.startDate).getTime();
                    const dateB = new Date(b.startDate).getTime();
                    return dateA - dateB;
                });
            } else if (this.sortBy === 'price') {
                this.filteredCourses.sort((a, b) => {
                    const priceA = parseFloat(a.price.replace(/[^0-9.]/g, ''));
                    const priceB = parseFloat(b.price.replace(/[^0-9.]/g, ''));
                    return priceA - priceB;
                });
            }
            this.currentPage = 1;
        },
        
        // Filter courses by search query
        filterCourses() {
            if (!this.searchQuery.trim()) {
                this.filteredCourses = [...this.allCourses];
            } else {
                const query = this.searchQuery.toLowerCase();
                this.filteredCourses = this.allCourses.filter(course => 
                    course.name.toLowerCase().includes(query) || 
                    course.id.toLowerCase().includes(query)
                );
            }
            this.currentPage = 1;
            if (this.sortBy) {
                this.sortCourses();
            }
        },
        
        // Clear search
        clearSearch() {
            this.searchQuery = '';
            this.filterCourses();
        },
        
        // Highlight search text
        highlightText(text) {
            if (!this.searchQuery.trim()) {
                return text;
            }
            const regex = new RegExp(`(${this.searchQuery})`, 'gi');
            return text.replace(regex, '<span class="text-red-500 font-semibold">$1</span>');
        },
        
        // Pagination
        prevPage() {
            if (this.currentPage > 1) {
                this.loadPage(this.currentPage - 1);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        },

        nextPage() {
            // Attempt to load next page JSON. We don't assume totalPages from client-side data.
            this.loadPage(this.currentPage + 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        },
        
        // Load page data (for external pagination files)
        async loadPage(pageNumber) {
            // Reuse loadCourses logic which tries multiple filename patterns
            await this.loadCourses(pageNumber);
        },
        
        // Go to course detail page
        goToCourseDetail(courseId) {
            // For now, just open detail.html in same window
            // In a real app, you would use Vue Router
            window.location.href = `detail.html?id=${courseId}`;
        },
        
        // Enrollment process
        startEnrollment(course) {
            this.selectedCourse = course;
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
            // In a real application, you would send this data to a server
            console.log('Enrollment submitted:', {
                course: this.selectedCourse,
                formData: this.formData
            });
            
            this.showEnrollment = false;
            this.showSuccess = true;
            this.resetForm();
        },
        
        closeSuccess() {
            this.showSuccess = false;
        }
    },
    
    mounted() {
        // Determine page number from query ?page= or default to 1
        const params = new URLSearchParams(window.location.search);
        const page = parseInt(params.get('page') || '1', 10) || 1;
        this.loadCourses(page);
    }
}).mount('#app');

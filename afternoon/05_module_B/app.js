// --- Populate course info from URL ---
const params = new URLSearchParams(window.location.search);
const courseData = {
  name: params.get('name'),
  code: params.get('code'),
  startDate: params.get('startDate'),
  price: params.get('price'),
  image: params.get('image'),
};

const courseInfoEl = document.getElementById('courseInfo');

if (courseInfoEl && courseData.name) {
    courseInfoEl.innerHTML = `
        <img src="${decodeURIComponent(courseData.image)}" alt="${decodeURIComponent(courseData.name)}" class="w-full sm:w-48 h-32 sm:h-auto object-cover rounded-t-lg sm:rounded-l-lg sm:rounded-t-none">
        <div class="flex-1 p-1">
            <h3 class="font-bold text-lg text-teal-700">${decodeURIComponent(courseData.name)}</h3>
            <p class="text-sm text-gray-500 mt-1">課程編號: ${decodeURIComponent(courseData.code)}</p>
            <p class="text-sm text-gray-500 mt-1">開課日期: ${decodeURIComponent(courseData.startDate)}</p>
            <p class="text-2xl font-bold text-red-600 mt-2">$${decodeURIComponent(courseData.price)}</p>
        </div>
    `;
}


// --- Custom Dropdown Logic ---
function setupDropdown(detailsId, optionsId, inputId, selectedId) {
    const detailsEl = document.getElementById(detailsId);
    const optionsEl = document.getElementById(optionsId);
    const inputEl = document.getElementById(inputId);
    const selectedEl = document.getElementById(selectedId);

    if (!detailsEl || !optionsEl || !inputEl || !selectedEl) return;

    optionsEl.addEventListener('click', (e) => {
        const button = e.target.closest('button');
        if (button) {
            const value = button.dataset.value;
            const text = button.textContent;
            
            inputEl.value = value;
            selectedEl.textContent = text;
            
            // Manually close the details dropdown
            detailsEl.removeAttribute('open');
            
            // Trigger validation
            validateField(inputEl.name);
        }
    });
}

setupDropdown('gender-details', 'gender-options', 'gender', 'gender-selected');
setupDropdown('phone-country-details', 'phone-country-options', 'phoneCountry', 'phone-country-selected');


const steps = [...document.querySelectorAll('.step')];
const toStep3 = document.getElementById('toStep3');
const backTo2 = document.getElementById('backTo2');
const submitBtn = document.getElementById('submitBtn');
const summary = document.getElementById('summary');

// --- Toast Logic ---
const toast = document.getElementById('toast');
const toastMessage = document.getElementById('toastMessage');
const closeToast = document.getElementById('closeToast');
let toastTimer = null;

function showToast(message, duration = 3000) {
  if (!toast || !toastMessage) return;
  
  const currentLang = localStorage.getItem('lang') || 'zh';
  const closeText = I18N[currentLang].btnClose;
  
  toastMessage.textContent = message;
  closeToast.textContent = closeText;

  toast.classList.remove('opacity-0', 'translate-y-6');
  toast.classList.add('opacity-100', 'translate-y-0');
  
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { hideToast(); }, duration);
}

function hideToast() {
  if (!toast) return;
  toast.classList.remove('opacity-100', 'translate-y-0');
  toast.classList.add('opacity-0', 'translate-y-6');
}

if (closeToast) {
    closeToast.addEventListener('click', hideToast);
}
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') hideToast(); });


const form = document.getElementById('dataForm');

function showStep(n){
  steps.forEach(s=>{
    const is = Number(s.dataset.step)===n;
    s.classList.toggle('hidden', !is);
  });
}

function showError(elem, msg){
  const err = document.querySelector(`.field-error[data-for="${elem}"]`);
  if(err) err.textContent = msg || '';
}

function validateField(fieldName) {
    const fieldElement = document.getElementById(fieldName);
    if (!fieldElement) return true;

    const value = fieldElement.value.trim();
    let ok = true;
    const currentLang = localStorage.getItem('lang') || 'zh';
    const errors = I18N[currentLang].errors;

    showError(fieldName, '');

    switch (fieldName) {
        case 'name':
            if (!value) { showError('name', errors.name); ok = false; }
            break;
        case 'gender':
            if (!value) { showError('gender', errors.gender); ok = false; }
            break;
        case 'birthdate':
            if (!value) { showError('birthdate', errors.birthdate); ok = false; }
            break;
        case 'phone':
            if (!value) {
                showError('phone', errors.phone);
                ok = false;
            } else {
                const digits = value.replace(/\D/g, '');
                const code = document.getElementById('phoneCountry').value;
                if (code === '+86') {
                    if (digits.length !== 11) { showError('phone', errors.phone_cn); ok = false; }
                } else if (code === '+852' || code === '+853') {
                    if (digits.length !== 8) { showError('phone', errors.phone_hk_mo); ok = false; }
                } else {
                    if (digits.length < 8) { showError('phone', errors.phone_format); ok = false; }
                }
            }
            break;
        case 'email':
            if (value) {
                const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRe.test(value)) {
                    showError('email', errors.email_format);
                    ok = false;
                }
            }
            break;
    }
    return ok;
}


function validateForm(){
  let isFormValid = true;
  ['name', 'gender', 'birthdate', 'phone', 'email'].forEach(fieldName => {
      if (!validateField(fieldName)) {
          isFormValid = false;
      }
  });
  return isFormValid;
}

// Add event listeners for real-time validation
['name', 'birthdate', 'phone', 'email'].forEach(fieldName => {
    document.getElementById(fieldName).addEventListener('input', () => validateField(fieldName));
});

/* This function is now replaced by the new toast logic
function showToast(msg, duration = 3000){
  toast.textContent = msg; toast.classList.remove('hidden');
  setTimeout(()=>toast.classList.add('hidden'), duration);
}
*/

// Step navigation
backTo2.addEventListener('click', ()=> showStep(1));

toStep3.addEventListener('click', ()=>{
  if(!validateForm()) return;
  
  const values = {
    name: document.getElementById('name').value.trim(),
    gender: document.getElementById('gender-selected').textContent,
    birthdate: document.getElementById('birthdate').value,
    phone: document.getElementById('phone').value.trim(),
    phoneCountry: document.getElementById('phone-country-selected').textContent,
    email: document.getElementById('email').value.trim()
  };
  
  const currentLang = localStorage.getItem('lang') || 'zh';
  const labels = I18N[currentLang].summaryLabels;

  // populate summary
  summary.innerHTML = `
    <p><strong>${labels.name}</strong>${values.name}</p>
    <p><strong>${labels.gender}</strong>${values.gender}</p>
    <p><strong>${labels.birthdate}</strong>${values.birthdate}</p>
    <p><strong>${labels.phone}</strong>${values.phoneCountry} ${values.phone}</p>
    <p><strong>${labels.email}</strong>${values.email || I18N[currentLang].notFilled}</p>
  `;
  // show confirmation step (data-step=2)
  showStep(2);
});

submitBtn.addEventListener('click', ()=>{
  if(!validateForm()){ showStep(1); return }
  
  const currentLang = localStorage.getItem('lang') || 'zh';
  const messages = I18N[currentLang];

  showToast(messages.submitSuccess, 3000);
  localStorage.setItem('registrationSuccess', 'true');
  setTimeout(()=>{
    window.location.href = 'index.html';
  }, 3000);
});

// init
// ensure steps have initial hidden state (step 1 visible)
showStep(1);
const I18N = {
  en: {
    // ... existing ...
    submitSuccess: 'Registration successful! Redirecting to homepage in 3 seconds...',
    registrationSuccess: 'Registration Successful!',
    btnClose: 'Close',
    summaryLabels: {
        name: 'Name: ',
        gender: 'Gender: ',
        birthdate: 'Birthdate: ',
        phone: 'Phone: ',
        email: 'Email: '
    },
    notFilled: '(Not provided)',
    errors: {
        name: 'Please enter your name',
        gender: 'Please select your gender',
        birthdate: 'Please enter your birthdate',
        phone: 'Please enter your phone number',
        phone_cn: 'Mainland China phone numbers must be 11 digits',
        phone_hk_mo: 'Hong Kong/Macau phone numbers must be 8 digits',
        phone_format: 'Invalid phone number format',
        email_format: 'Invalid email format'
    }
  },
  zh: {
    // ... existing ...
    submitSuccess: '報名成功！3秒後將返回首頁...',
    registrationSuccess: '報名成功！',
    btnClose: '關閉',
    summaryLabels: {
        name: '姓名：',
        gender: '性別：',
        birthdate: '出生日期：',
        phone: '電話：',
        email: '電郵：'
    },
    notFilled: '（未填）',
    errors: {
        name: '請填寫姓名',
        gender: '請選擇性別',
        birthdate: '請填寫出生日期',
        phone: '請填寫電話',
        phone_cn: '中國大陸電話須為11位數字',
        phone_hk_mo: '港澳電話須為8位數字',
        phone_format: '電話格式錯誤',
        email_format: '電郵格式錯誤'
    }
  }
};

function updateTexts(lang) {
  const currentLang = lang || localStorage.getItem('lang') || 'zh';
  localStorage.setItem('lang', currentLang);
  document.documentElement.lang = currentLang;

  // Update form labels and placeholders
  document.getElementById('nameLabel').textContent = I18N[currentLang].name;
  document.getElementById('genderLabel').textContent = I18N[currentLang].gender;
  document.getElementById('birthdateLabel').textContent = I18N[currentLang].birthdate;
  document.getElementById('phoneLabel').textContent = I18N[currentLang].phone;
  document.getElementById('emailLabel').textContent = I18N[currentLang].email;

  document.getElementById('name').setAttribute('placeholder', I18N[currentLang].namePlaceholder);
  document.getElementById('gender-selected').setAttribute('placeholder', I18N[currentLang].genderPlaceholder);
  document.getElementById('birthdate').setAttribute('placeholder', I18N[currentLang].birthdatePlaceholder);
  document.getElementById('phone').setAttribute('placeholder', I18N[currentLang].phonePlaceholder);
  document.getElementById('email').setAttribute('placeholder', I18N[currentLang].emailPlaceholder);

  // Update summary labels
  const labels = I18N[currentLang].summaryLabels;
  summary.innerHTML = `
    <p><strong>${labels.name}</strong>${values.name}</p>
    <p><strong>${labels.gender}</strong>${values.gender}</p>
    <p><strong>${labels.birthdate}</strong>${values.birthdate}</p>
    <p><strong>${labels.phone}</strong>${values.phoneCountry} ${values.phone}</p>
    <p><strong>${labels.email}</strong>${values.email || I18N[currentLang].notFilled}</p>
  `;

  // Update error messages
  Object.keys(I18N[currentLang].errors).forEach(key => {
      const errorElem = document.getElementById(`${key}Error`);
      if (errorElem) {
          errorElem.textContent = I18N[currentLang].errors[key];
      }
  });
}

// رابط ملف السيرفر الذي يستقبل الطلبات
const SERVER_URL = 'http:///htdocs/real_estate/get_properties.php'; // استبدل الرابط حسب الخادم الخاص بك

// عنصر يحتوي على قائمة العرض
const propertyList = document.getElementById('propertyList');

// لتخزين اسم العقار الحالي عند إضافة مرفق
let currentPropertyName = '';

// عند تحميل الصفحة، نجلب قائمة العقارات
window.onload = () => {
    fetchProperties();
};

// جلب جميع العقارات من الخادم وعرضها
function fetchProperties() {
    fetch(`${SERVER_URL}/get_properties.php`)
        .then(response => response.json())
        .then(data => {
            propertyList.innerHTML = '<h2 class="h5">العقارات المتوفرة</h2>';
            data.forEach(addPropertyToList);
        })
        .catch(error => console.error('Error:', error));
}

// إضافة عقار جديد
function addProperty() {
    const name = document.getElementById("propertyName").value;
    const location = document.getElementById("propertyLocation").value;
    const price = document.getElementById("propertyPrice").value;
    const type = document.getElementById("propertyType").value;
    const description = document.getElementById("propertyDescription").value;

    if (!name || !location || !price || !type || !description) {
        alert("يرجى ملء جميع الحقول!");
        return;
    }

    const property = { name, location, price, type, description };

    fetch(`${SERVER_URL}/add_property.php`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(property),
    })
        .then(response => response.json())
        .then(data => {
            console.log('تم الإرسال:', data);
            alert(data.message);
            fetchProperties(); // تحديث العقارات بعد الإضافة
        })
        .catch(error => console.error('حدث خطأ:', error));
}

// عرض العقارات
function displayProperties() {
    fetch(`${SERVER_URL}/get_properties.php`)
        .then(response => response.json())
        .then(properties => {
            const propertyList = document.getElementById("propertyList");
            propertyList.innerHTML = "";

            properties.forEach(property => {
                const propertyCard = `
                    <div class="card mb-3 property-card">
                        <div class="row g-0">
                            <div class="col-md-4">
                                <img src="placeholder.jpg" alt="صورة العقار" class="img-fluid rounded-start">
                            </div>
                            <div class="col-md-8">
                                <div class="card-body">
                                    <h5 class="card-title">${property.title}</h5>
                                    <p class="card-text">${property.description}</p>
                                    <p class="card-text"><small class="text-muted">الموقع: ${property.location}</small></p>
                                    <p class="card-text"><small class="text-muted">السعر: ${property.price} ريال</small></p>
                                </div>
                            </div>
                        </div>
                    </div>`;
                propertyList.innerHTML += propertyCard;
            });
        })
        .catch(error => console.error('حدث خطأ أثناء تحميل العقارات:', error));
}

// إضافة العقار إلى واجهة العرض
function addPropertyToList(property) {
    const card = document.createElement('div');
    card.className = 'card mb-3 property-card';

    // عرض صورة أولى في حال كانت موجودة
    let firstImageHtml = '';
    if (property.images && property.images.length > 0) {
        firstImageHtml = `<img src="${property.images[0]}" alt="${property.title}" />`;
    }

    // إعداد المرفقات (جميع الصور)
    let attachmentsHtml = '';
    if (property.images && property.images.length > 0) {
        attachmentsHtml = `
            <div class="mt-3 property-attachments">
                ${property.images.map((img, index) => `
                    <div class="attachment-item">
                        <img src="${img}" alt="مرفق ${index + 1}">
                        <button onclick="deleteAttachment('${property.title}', ${index})">&times;</button>
                    </div>
                `).join('')}
            </div>
        `;
    }

    // أزرار التحكم (إضافة مرفق، تعديل، حذف)
    const buttonsHtml = `
        <div class="d-flex gap-2 mt-3">
            <button class="btn btn-outline-primary btn-sm" onclick="addAttachment('${property.title}')">
                <i class="bi bi-paperclip"></i> إضافة مرفق
            </button>
            <button class="btn btn-outline-warning btn-sm" onclick="editProperty('${property.title}')">
                <i class="bi bi-pencil-square"></i> تعديل
            </button>
            <button class="btn btn-outline-danger btn-sm" onclick="deleteProperty('${property.title}')">
                <i class="bi bi-trash"></i> حذف
            </button>
        </div>
    `;

    card.innerHTML = `
        ${firstImageHtml}
        <div class="card-body">
            <h5 class="card-title">${property.title}</h5>
            <p class="card-text"><strong>الموقع:</strong> ${property.location}</p>
            <p class="card-text"><strong>السعر:</strong> ${property.price} ريال</p>
            <p class="card-text"><strong>النوع:</strong> ${property.type}</p>
            <p class="card-text">${property.description}</p>
            ${buttonsHtml}
            ${attachmentsHtml}
        </div>
    `;

    propertyList.appendChild(card);
}

// فتح النافذة المنبثقة لإضافة المرفقات
function addAttachment(propertyName) {
    currentPropertyName = propertyName;
    const modal = document.getElementById('attachmentModal');
    modal.style.display = "block";
}

// إغلاق النافذة المنبثقة
function closeModal() {
    const modal = document.getElementById('attachmentModal');
    modal.style.display = "none";
    document.getElementById('newAttachment').value = '';
}

// حفظ المرفق الجديد
function saveNewAttachment() {
    const newAttachment = document.getElementById('newAttachment').files[0];
    if (!newAttachment) {
        alert('يرجى اختيار صورة جديدة.');
        return;
    }

    const formData = new FormData();
    formData.append('action', 'addAttachment');
    formData.append('propertyName', currentPropertyName);
    formData.append('newAttachment', newAttachment);

    fetch(`${SERVER_URL}/add_attachment.php`, {
        method: 'POST',
        body: formData
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('تم إضافة المرفق بنجاح.');
                closeModal();
                fetchProperties();
            } else {
                alert(data.message || 'حدث خطأ في إضافة المرفق.');
            }
        })
        .catch(error => console.error('Error:', error));
}

// حذف المرفق
function deleteAttachment(propertyName, index) {
    if (!confirm('هل أنت متأكد من حذف هذا المرفق؟')) return;

    fetch(`${SERVER_URL}/delete_attachment.php?propertyName=${encodeURIComponent(propertyName)}&index=${index}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('تم حذف المرفق بنجاح.');
                fetchProperties();
            } else {
                alert(data.message || 'حدث خطأ في حذف المرفق.');
            }
        })
        .catch(error => console.error('Error:', error));
}

// حذف العقار بالكامل
function deleteProperty(propertyName) {
    if (!confirm('هل أنت متأكد من حذف العقار بالكامل؟')) return;

    fetch(`${SERVER_URL}/delete_property.php?propertyName=${encodeURIComponent(propertyName)}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('تم حذف العقار بنجاح.');
                fetchProperties();
            } else {
                alert(data.message || 'حدث خطأ في حذف العقار.');
            }
        })
        .catch(error => console.error('Error:', error));
}

// تعديل العقار
function editProperty(propertyName) {
    fetch(`${SERVER_URL}/get_property.php?propertyName=${encodeURIComponent(propertyName)}`)
        .then(response => response.json())
        .then(data => {
            if (!data.success) {
                alert(data.message);
                return;
            }
            const property = data.property;
            document.getElementById('propertyName').value = property.title;
            document.getElementById('propertyLocation').value = property.location;
            document.getElementById('propertyPrice').value = property.price;
            document.getElementById('propertyDescription').value = property.description;
            document.getElementById('propertyType').value = property.type;
            deleteProperty(propertyName);
        })
        .catch(error => console.error('Error:', error));
}

// تصفية العقارات
function filterPropertiesAdmin() {
    const minPrice = parseFloat(document.getElementById('minPriceAdmin').value) || 0;
    const maxPrice = parseFloat(document.getElementById('maxPriceAdmin').value) || Number.MAX_VALUE;
    const type = document.getElementById('propertyTypeAdmin').value;

    fetch(`${SERVER_URL}/get_properties.php`)
        .then(response => response.json())
        .then(data => {
            const filtered = data.filter(property => {
                return (
                    property.price >= minPrice &&
                    property.price <= maxPrice &&
                    (type === "" || property.type === type)
                );
            });
            displayProperties(filtered);
        })
        .catch(error => console.error('Error filtering properties:', error));
}
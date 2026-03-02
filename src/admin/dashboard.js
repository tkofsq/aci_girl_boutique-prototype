import { supabase } from '../shared/scripts/supabase.js'

const loginContainer = document.getElementById('loginContainer');
const tabsContainer = document.getElementById('tabsContainer');
const dashboardContent = document.getElementById('dashboardContent');
const loginBtn = document.getElementById('loginBtn');
const loginError = document.getElementById('loginError');

loginBtn.addEventListener('click', () => {
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();

  adminLogin(username, password)
});

async function adminLogin(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email,
    password: password
  })
  if (error) alert("Access Denied: " + error.message)
  else {
    loginContainer.style.display = 'none';
    tabsContainer.style.display = 'block';
    dashboardContent.style.display = 'block';
    showTab('diagnostics')
    refetch()
  }
}

window.refetch = async() => {
  const inv = document.getElementById("tinv");
  const { data, error } = await supabase.from('Inventory').select('*');
  if(error) return console.error("error:",error);
  else {
    inv.innerHTML = "";
    data.forEach((item) => {
      inv.innerHTML +=
      `
      <tr id="tr${item.id}">
        <td data-field="image" onclick="handleImageClick(${item.id})"><img width="100px" height="100px" alt="${item.name}" src="${item.image}"></td>
        <td contenteditable="true" data-field="name">${item.name}</td>
        <td contenteditable="true" data-field="category">${item.category}</td>
        <td contenteditable="true" data-field="status">${item.status}</td>
        <td contenteditable="true" data-field="quantity">${item.quantity}</td>
        <td contenteditable="true" data-field="price">${item.price}</td>
        <td contenteditable="true" data-field="discount">${item.discount}</td>
        <td>${item.final}</td>
        <td>
          <button>delete</button>
        </td>
      </tr>
      `
    })
  }
}

document.querySelectorAll('[data-field="image"]').forEach(cell => {
    cell.addEventListener('dblclick', () => {
        const newUrl = prompt("Enter new Image URL:", cell.querySelector('img').src);
        if (newUrl) {
            cell.querySelector('img').src = newUrl;
            // Optional: Mark row as dirty/changed
            cell.parentElement.classList.add('is-dirty');
        }
    });
});

window.updateChanges = async () => {
    const inventoryTab = document.getElementById('tinv');
    const rows = inventoryTab.querySelectorAll('table tbody tr');
    const bulkData = Array.from(rows).map(row => {
        const rawId = row.id.replace('tr', '');
        const numericId = Number(rawId);
        const imgElement = row.querySelector('td img');
        const imageUrl = imgElement ? imgElement.src : "";
        const editableCells = row.querySelectorAll('[contenteditable="true"]');
        const rowData = { 
            id: numericId,
            image: imageUrl 
        };
        editableCells.forEach(cell => {
            const field = cell.dataset.field;
            if (field) {
                let value = cell.innerText.trim();
                if (['quantity', 'price', 'discount'].includes(field)) {
                    value = Number(value);
                }
                rowData[field] = value;
            }
        });
        return rowData;
    }).filter(data => data !== null && !isNaN(data.id));
    const { data, error } = await supabase
        .from('Inventory')
        .upsert(bulkData);
    if (error) {
        console.error("Supabase Error:", error.message);
        alert("Failed to sync: " + error.message);
    } else {
        alert("Inventory updated successfully!");
    }
};

window.handleImageClick = (id) => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';

    fileInput.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Find the image in the specific row
        const imgElement = document.querySelector(`#tr${id} img`);
        
        // 1. Visual cue that upload is starting
        imgElement.style.filter = "blur(2px) grayscale(100%)";

        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', 'unsigned');
        
        const _cloudname = 'dzfaeh7do';
        
        try {
            const res = await fetch(`https://api.cloudinary.com/v1_1/${_cloudname}/image/upload`, {
                method: 'POST',
                body: formData
            });
            const data = await res.json();

            if (data.secure_url) {
                // 2. Update the DOM. 
                // Your existing save function will now see this new URL!
                imgElement.src = data.secure_url;
            }
        } catch (err) {
            console.error("Upload failed", err);
        } finally {
            imgElement.style.filter = "none";
        }
    };

    fileInput.click();
};

document.addEventListener('keydown', (e) => {
    if (e.target.hasAttribute('contenteditable') && e.key === 'Enter') {
        e.preventDefault();
        e.target.blur();
    }
});

// Function to switch tabs
function showTab(tabId) {
  document.querySelectorAll('.tab-content').forEach(tab => tab.style.display = 'none');
  document.getElementById(tabId).style.display = 'block';

  document.querySelectorAll('.tabs button').forEach(btn => btn.classList.remove('active'));
  document.querySelector(`.tabs button[data-tab="${tabId}"]`).classList.add('active');
}

// Tab button listeners
document.querySelectorAll('.tabs button').forEach(btn => {
  btn.addEventListener('click', () => showTab(btn.dataset.tab));
});

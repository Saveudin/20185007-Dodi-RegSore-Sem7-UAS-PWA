if ('serviceWorker' in navigator) {
    window.addEventListener('load', () =>
    navigator.serviceWorker.register('sw.js')
        .then(regisration => console.log('Service Worker registered'))
        .catch(err => 'SW registration failed'))
}


// Mendapatkan referensi ke tabel dan input
const commentTable = document.getElementById('commentTable');
const commentInput = document.getElementById('comment');

// Membuat database dan object store
const dbName = 'CommentDB';
const dbVersion = 1;
const objectStoreName = 'comments';

let db;

const request = indexedDB.open(dbName, dbVersion);

request.onerror = function(event) {
    console.error('Error opening database:', event.target.errorCode);
};

request.onsuccess = function(event) {
    console.log('Database opened successfully');
    db = event.target.result;
    displayComments();
};

request.onupgradeneeded = function(event) {
    const db = event.target.result;
    const objectStore = db.createObjectStore(objectStoreName, { keyPath: 'id', autoIncrement: true });
    objectStore.createIndex('comment', 'comment', { unique: false });
};

// Fungsi untuk menyimpan komentar
function saveComment() {
    const commentText = commentInput.value.trim();

    if (commentText === '') {
        alert('Mohon isi komentar terlebih dahulu.');
        return;
    }

    const transaction = db.transaction([objectStoreName], 'readwrite');
    const objectStore = transaction.objectStore(objectStoreName);
    const newComment = { comment: commentText };

    const addRequest = objectStore.add(newComment);

    addRequest.onsuccess = function() {
        console.log('Komentar berhasil disimpan.');
        commentInput.value = '';
        displayComments();
    };

    addRequest.onerror = function(event) {
        console.error('Error adding comment:', event.target.error);
    };
}


// Fungsi untuk menampilkan komentar
function displayComments() {
    const transaction = db.transaction([objectStoreName], 'readonly');
    const objectStore = transaction.objectStore(objectStoreName);
    const getAllRequest = objectStore.getAll();

    getAllRequest.onsuccess = function() {
        const comments = getAllRequest.result;
        renderComments(comments);
    };
}

// Fungsi untuk merender komentar ke dalam tabel
function renderComments(comments) {
    const tbody = commentTable.querySelector('tbody');
    tbody.innerHTML = '';

    comments.forEach(comment => {
        const row = tbody.insertRow();
        const cell1 = row.insertCell(0);
        const cell2 = row.insertCell(1);

        cell1.textContent = comment.comment;

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Hapus';
        deleteButton.onclick = function() {
            deleteComment(comment.id);
        };

        cell2.appendChild(deleteButton);
    });
}

// Fungsi untuk menghapus komentar
function deleteComment(commentId) {
    const transaction = db.transaction([objectStoreName], 'readwrite');
    const objectStore = transaction.objectStore(objectStoreName);
    const deleteRequest = objectStore.delete(commentId);

    deleteRequest.onsuccess = function() {
        console.log('Komentar berhasil dihapus.');
        displayComments();
    };

    deleteRequest.onerror = function(event) {
        console.error('Error deleting comment:', event.target.error);
    };
}

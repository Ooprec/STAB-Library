sessionStorage.setItem('scannedBooks', JSON.stringify([]));
var previousCode = '';
document.addEventListener('DOMContentLoaded', () => {
    const video = document.getElementById('barcode-video');

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert('Camera API not supported.');
        return;
    }

    Quagga.init({
        inputStream: {
            name: "Live",
            type: "LiveStream",
            target: video,
            constraints: {
                facingMode: "environment"
            }
        },
        decoder: {
            readers: [
                "code_128_reader",
                "ean_reader",
                "ean_8_reader",
                "code_39_reader",
                "upc_reader",
                "upc_e_reader"
            ]
        }
    }, function(err) {
        if (err) {
            console.error(err);
            return;
        }
        Quagga.start();
    });
    Quagga.onDetected(function(result) {
        const code = result.codeResult.code;
        if (code == previousCode) {
            return;
        }
        previousCode = code;
        // Quagga.stop();

        // Fetch book data from Open Library
        fetch(`https://openlibrary.org/api/books?bibkeys=ISBN:${code}&format=json&jscmd=data`)
            .then(response => response.json())
            .then(data => {
                const book = data[`ISBN:${code}`];
                if (book) {
                    console.log('Book data:', book);
                    alert(`Title: ${book.title}\nAuthor: ${book.authors?.map(a => a.name).join(', ') || 'Unknown'}\nPublished: ${book.publish_date || 'Unknown'}`);
                    let books = JSON.parse(sessionStorage.getItem('scannedBooks') || '[]');
                    if (!books.some(b => b.isbn === code)) {
                        books.push({
                            isbn: code,
                            title: book.title,
                            authors: book.authors?.map(a => a.name) || [],
                            published: book.publish_date || ''
                        });
                        let uniqueBooks = [... new Set(books)];
                        sessionStorage.setItem('scannedBooks', JSON.stringify(uniqueBooks));
                    }
                } else {
                    // alert('No book data found for ISBN: ' + code);
                }
            })
            .catch(err => {
                console.error('Error fetching book data:', err);
                alert('Error fetching book data.');
            });
    });

    // Set up camera stream for the video element
    navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
        .then(stream => {
            video.srcObject = stream;
            video.play();
        })
        .catch(err => {
            console.error('Error accessing camera:', err);
            alert('Could not access the camera.');
        });
    
    
    // Add a targeting area overlay to help users align barcodes
    const overlay = document.createElement('div');
    overlay.style.position = 'absolute';
    overlay.style.border = '3px solid #00FF00';
    overlay.style.borderRadius = '8px';
    overlay.style.pointerEvents = 'none';
    overlay.style.width = '60%';
    overlay.style.height = '30%';
    overlay.style.top = '35%';
    overlay.style.left = '20%';
    overlay.style.boxSizing = 'border-box';
    overlay.style.zIndex = '10';

    // Ensure the video is wrapped in a container for proper overlay alignment
    let container = video.parentElement;
    if (!container || !container.classList.contains('video-container')) {
        container = document.createElement('div');
        container.className = 'video-container';
        container.style.position = 'relative';
        video.parentNode.insertBefore(container, video);
        container.appendChild(video);
    } else {
        container.style.position = 'relative';
    }

    // Make the overlay match the video element's size and position
    function updateOverlaySize() {
        const rect = video.getBoundingClientRect();
        overlay.style.width = rect.width * 0.6 + 'px';
        overlay.style.height = rect.height * 0.3 + 'px';
        overlay.style.left = rect.width * 0.2 + 'px';
        overlay.style.top = rect.height * 0.35 + 'px';
    }

    // Position overlay absolutely over the video
    overlay.style.position = 'absolute';
    overlay.style.pointerEvents = 'none';
    container.appendChild(overlay);

    // Update overlay size on load and resize
    video.addEventListener('loadedmetadata', updateOverlaySize);
    window.addEventListener('resize', updateOverlaySize);
    updateOverlaySize();



});

document.getElementById('save-button').addEventListener('click', () => {
    const books = JSON.parse(sessionStorage.getItem('scannedBooks') || '[]');
    if (!books.length) {
        alert('No books to save.');
        return;
    }
    const csvRows = [
        ['ISBN', 'Title', 'Authors', 'Published'],
        ...books.map(book => [
            book.isbn,
            `"${book.title.replace(/"/g, '""')}"`,
            `"${(book.authors || []).join('; ').replace(/"/g, '""')}"`,
            `"${(book.published || '').replace(/"/g, '""')}"`
        ])
    ];
    const csvContent = csvRows.map(row => row.join(',')).join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'scanned_books.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
});

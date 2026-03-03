document.addEventListener('DOMContentLoaded', () => {
    // Make navbar dark when scrolling away from top
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.style.backgroundColor = 'rgba(28, 61, 122, 0.9)'; // Navy blue
            navbar.style.padding = '15px 5%';
            navbar.style.backdropFilter = 'blur(10px)';
            navbar.style.position = 'fixed';
            navbar.style.boxShadow = '0 4px 10px rgba(0,0,0,0.1)';
        } else {
            navbar.style.backgroundColor = 'transparent';
            navbar.style.padding = '20px 5%';
            navbar.style.backdropFilter = 'none';
            navbar.style.position = 'absolute';
            navbar.style.boxShadow = 'none';
        }
    });

    // Mobile menu toggle
    const menuIcon = document.querySelector('.menu-icon');
    const navLinks = document.querySelector('.nav-links');
    const navItems = document.querySelectorAll('.nav-links a');

    if (menuIcon && navLinks) {
        menuIcon.addEventListener('click', () => {
            navLinks.classList.toggle('active');

            // Toggle hamburger to close (X) icon logic if needed visually
            const svg = menuIcon.querySelector('svg');
            if (navLinks.classList.contains('active')) {
                svg.innerHTML = '<line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>';
            } else {
                svg.innerHTML = '<line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line>';
            }
        });

        // Close menu when a link is clicked
        navItems.forEach(item => {
            item.addEventListener('click', () => {
                navLinks.classList.remove('active');
                if (menuIcon.querySelector('svg')) {
                    menuIcon.querySelector('svg').innerHTML = '<line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line>';
                }
            });
        });
    }

    // Fetch and display activities
    fetchActivities();

    // Fetch and display upcoming events
    fetchEvents();

    // Fetch and display dynamic contact info
    fetchContactDisplay();

    // Fetch and display execom photos
    fetchExecomPhotos();

    // Lightbox Logic
    initLightbox();
});

function initLightbox() {
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const captionText = document.getElementById('lightbox-caption');
    const closeBtn = document.querySelector('.lightbox-close');

    if (!lightbox) return;

    // Close on click close button
    closeBtn.onclick = function () {
        lightbox.style.display = "none";
        document.body.style.overflow = 'auto'; // Re-enable scroll
    }

    // Close when clicking outside the image
    lightbox.onclick = function (e) {
        if (e.target === lightbox) {
            lightbox.style.display = "none";
            document.body.style.overflow = 'auto';
        }
    }

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && lightbox.style.display === "block") {
            lightbox.style.display = "none";
            document.body.style.overflow = 'auto';
        }
    });

    // Global listener for images with 'clickable' class or potential targets
    document.body.addEventListener('click', (e) => {
        if (e.target.tagName === 'IMG' && (
            e.target.classList.contains('activity-img') ||
            e.target.classList.contains('event-img') ||
            e.target.classList.contains('execom-img') ||
            e.target.classList.contains('gallery-thumb')
        )) {
            lightbox.style.display = "block";
            lightboxImg.src = e.target.src;
            captionText.innerHTML = e.target.alt || "";
            document.body.style.overflow = 'hidden'; // Disable scroll
        }
    });
}

async function fetchContactDisplay() {
    try {
        const response = await fetch('/api/contact');
        const result = await response.json();
        if (result.message === 'success' && result.data) {
            const info = result.data;
            const emailEl = document.getElementById('display-email');
            const phoneEl = document.getElementById('display-phone');
            const instaLinkEl = document.getElementById('display-instagram-link');
            const instaHandleEl = document.getElementById('display-instagram-handle');

            if (emailEl) emailEl.textContent = info.email;
            if (phoneEl) phoneEl.textContent = info.phone;
            if (instaLinkEl) instaLinkEl.href = info.instagram_url;
            if (instaHandleEl) instaHandleEl.textContent = info.instagram_handle;
        }
    } catch (error) {
        console.error('Error fetching contact display info:', error);
    }
}


async function fetchActivities() {
    const container = document.getElementById('activities-container');

    try {
        const response = await fetch('/api/activities');
        const result = await response.json();

        if (result.message === 'success') {
            const activities = result.data;

            if (activities.length === 0) {
                container.innerHTML = '<p class="loading-spinner">No activities posted yet. Check back soon!</p>';
                return;
            }

            // Clear loading spinner
            container.innerHTML = '';

            // Render activities
            activities.forEach(activity => {
                const card = document.createElement('div');
                card.className = 'activity-card';

                const mainImageUrl = activity.image_path;
                const images = activity.images || [mainImageUrl];

                let galleryHtml = '';
                if (images.length > 1) {
                    galleryHtml = `
                        <div class="activity-images-gallery">
                            ${images.map(img => `
                                <img src="${img}" alt="${escapeHtml(activity.title)}" class="gallery-thumb" onclick="this.closest('.activity-card').querySelector('.activity-img').src = this.src">
                            `).join('')}
                        </div>
                    `;
                }

                card.innerHTML = `
                    <div class="activity-image-container cursor-pointer">
                        <img src="${mainImageUrl}" alt="${escapeHtml(activity.title)}" class="activity-img" onerror="this.src='data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22400%22%20height%3D%22200%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20400%20200%22%20preserveAspectRatio%3D%22none%22%3E%3Cdefs%3E%3Cstyle%20type%3D%22text%2Fcss%22%3E%23holder_1_text%20%7B%20fill%3A%23999%3Bfont-weight%3Anormal%3Bfont-family%3AHelvetica%2C%20monospace%3Bfont-size%3A20pt%20%7D%20%3C%2Fstyle%3E%3C%2Fdefs%3E%3Cg%20id%3D%22holder_1%22%3E%3Crect%20width%3D%22400%22%20height%3D%22200%22%20fill%3D%22%23eee%22%3E%3C%2Frect%3E%3Cg%3E%3Ctext%20id%3D%22holder_1_text%22%20x%3D%22144.3359375%22%20y%3D%22108.5%22%3EImage%20Not%20Found%3C%2Ftext%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E'">
                    </div>
                    <div class="activity-content">
                        <h3 class="activity-title">${escapeHtml(activity.title)}</h3>
                        <p class="activity-desc">${escapeHtml(activity.description)}</p>
                        ${galleryHtml}
                    </div>
                `;

                container.appendChild(card);
            });
        } else {
            container.innerHTML = '<p class="loading-spinner">Failed to load activities.</p>';
        }
    } catch (error) {
        console.error('Error fetching activities:', error);
        container.innerHTML = '<p class="loading-spinner">Error connecting to server to load activities.</p>';
    }
}

// Utility to prevent XSS
function escapeHtml(unsafe) {
    if (!unsafe) return '';
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

async function fetchEvents() {
    const container = document.getElementById('events-container');
    if (!container) return;

    try {
        const response = await fetch('/api/events');
        const result = await response.json();

        if (result.message === 'success') {
            const events = result.data;

            if (events.length === 0) {
                container.innerHTML = '<p class="loading-spinner">No upcoming events scheduled. Stay tuned!</p>';
                return;
            }

            container.innerHTML = '';

            events.forEach(event => {
                const card = document.createElement('div');
                card.className = 'event-card';

                const imageUrl = event.image_path || 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22400%22%20height%3D%22200%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20400%20200%22%20preserveAspectRatio%3D%22none%22%3E%3Cdefs%3E%3Cstyle%20type%3D%22text%2Fcss%22%3E%23holder_1_text%20%7B%20fill%3A%23999%3Bfont-weight%3Anormal%3Bfont-family%3AHelvetica%2C%20monospace%3Bfont-size%3A20pt%20%7D%20%3C%2Fstyle%3E%3C%2Fdefs%3E%3Cg%20id%3D%22holder_1%22%3E%3Crect%20width%3D%22400%22%20height%3D%22200%22%20fill%3D%22%23eee%22%3E%3C%2Frect%3E%3Cg%3E%3Ctext%20id%3D%22holder_1_text%22%20x%3D%22144.3359375%22%20y%3D%22108.5%22%3ENo%20Image%3C%2Ftext%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E';

                card.innerHTML = `
                    <div class="event-image-container cursor-pointer">
                        <img src="${imageUrl}" alt="${escapeHtml(event.title)}" class="event-img">
                        <div class="event-date-badge">${escapeHtml(event.date)}</div>
                    </div>
                    <div class="event-content">
                        <h3 class="event-title">${escapeHtml(event.title)}</h3>
                        <div class="event-info">
                            <span class="event-location">📍 ${escapeHtml(event.location)}</span>
                        </div>
                        <p class="event-desc">${escapeHtml(event.description)}</p>
                        ${event.link ? `<a href="${event.link}" target="_blank" class="event-link-btn">Learn More</a>` : ''}
                    </div>
                `;
                container.appendChild(card);
            });
        } else {
            container.innerHTML = '<p class="loading-spinner">Failed to load events.</p>';
        }
    } catch (error) {
        console.error('Error fetching events:', error);
        container.innerHTML = '<p class="loading-spinner">Error connecting to server.</p>';
    }
}

async function fetchExecomPhotos() {
    const container = document.getElementById('execom-container');
    if (!container) return;

    try {
        const response = await fetch('/api/execom-photos');
        const result = await response.json();

        if (result.message === 'success') {
            const photos = result.data;

            if (photos.length === 0) {
                container.innerHTML = '<p class="loading-spinner">No Execom photos yet. Check back soon!</p>';
                return;
            }

            container.innerHTML = '';

            photos.forEach(photo => {
                const card = document.createElement('div');
                card.className = 'execom-card cursor-pointer';
                card.innerHTML = `
                    <div class="execom-img-wrapper">
                        <img src="${photo.image_path}" alt="${escapeHtml(photo.caption)}" class="execom-img"
                            onerror="this.style.display='none'">
                    </div>
                    ${photo.caption ? `<p class="execom-caption">${escapeHtml(photo.caption)}</p>` : ''}
                `;
                container.appendChild(card);
            });
        } else {
            container.innerHTML = '<p class="loading-spinner">Failed to load Execom photos.</p>';
        }
    } catch (error) {
        console.error('Error fetching execom photos:', error);
        container.innerHTML = '<p class="loading-spinner">Error connecting to server.</p>';
    }
}

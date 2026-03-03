document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('image');
    const fileNameDisplay = document.getElementById('file-name');
    const form = document.getElementById('activity-form');
    const alertBox = document.getElementById('alert-message');
    const submitBtn = document.getElementById('submit-btn');
    const activitiesListContainer = document.getElementById('activities-list-container');

    // Update file name(s) when selected
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            const count = e.target.files.length;
            fileNameDisplay.textContent = count === 1 ? e.target.files[0].name : `${count} images selected`;
            fileNameDisplay.style.color = 'var(--primary-blue)';
            fileNameDisplay.style.fontWeight = '600';
        } else {
            fileNameDisplay.textContent = 'Drag and drop images or click to browse';
            fileNameDisplay.style.color = 'inherit';
            fileNameDisplay.style.fontWeight = 'normal';
        }
    });

    // Handle form submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Reset alert
        alertBox.style.display = 'none';
        alertBox.className = 'alert';

        // Update button state
        const originalBtnText = submitBtn.textContent;
        submitBtn.textContent = 'Uploading...';
        submitBtn.disabled = true;

        try {
            const formData = new FormData(form);

            const response = await fetch('/api/activities', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (response.ok) {
                // Success
                showAlert('Activity uploaded successfully!', 'success');
                form.reset();
                fileNameDisplay.textContent = 'Drag and drop an image or click to browse';
                fileNameDisplay.style.color = 'inherit';
                fileNameDisplay.style.fontWeight = 'normal';
                fetchActivities(); // Refresh the list of activities
            } else {
                // Server returned an error
                showAlert(result.error || 'Failed to upload activity.', 'error');
            }
        } catch (error) {
            console.error('Upload error:', error);
            showAlert('A network error occurred. Please try again.', 'error');
        } finally {
            // Restore button state
            submitBtn.textContent = originalBtnText;
            submitBtn.disabled = false;
        }
    });

    function showAlert(message, type) {
        alertBox.textContent = message;
        alertBox.className = `alert alert-${type}`;
        alertBox.style.display = 'block';
    }

    // Fetch and display activities
    async function fetchActivities() {
        if (!activitiesListContainer) return;

        try {
            const response = await fetch('/api/activities');
            const result = await response.json();

            if (response.ok) {
                renderActivities(result.data);
            } else {
                activitiesListContainer.innerHTML = `<p style="text-align: center; color: var(--text-light);">Failed to load activities.</p>`;
            }
        } catch (error) {
            console.error('Error fetching activities:', error);
            activitiesListContainer.innerHTML = `<p style="text-align: center; color: var(--text-light);">Error loading activities.</p>`;
        }
    }

    function renderActivities(activities) {
        if (!activities || activities.length === 0) {
            activitiesListContainer.innerHTML = `<p style="text-align: center; color: var(--text-light);">No activities found.</p>`;
            return;
        }

        activitiesListContainer.innerHTML = '';
        activities.forEach(activity => {
            const date = new Date(activity.created_at).toLocaleDateString();

            const item = document.createElement('div');
            item.className = 'activity-item';

            item.innerHTML = `
                <img src="${activity.image_path}" alt="${activity.title}">
                <div class="activity-item-content">
                    <div class="activity-item-title">${activity.title}</div>
                    <div class="activity-item-date">Added: ${date}</div>
                </div>
                <button class="btn-delete" data-id="${activity.id}">Delete</button>
            `;

            activitiesListContainer.appendChild(item);
        });

        // Add delete event listeners
        activitiesListContainer.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', handleDelete);
        });
    }

    async function handleDelete(e) {
        const id = e.target.getAttribute('data-id');
        if (!confirm('Are you sure you want to delete this activity?')) return;

        try {
            const response = await fetch(`/api/activities/${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                showAlert('Activity deleted successfully!', 'success');
                fetchActivities(); // Refresh list
            } else {
                const result = await response.json();
                showAlert(result.error || 'Failed to delete activity.', 'error');
            }
        } catch (error) {
            console.error('Delete error:', error);
            showAlert('A network error occurred. Please try again.', 'error');
        }
    }

    // Initial fetch
    fetchActivities();

    // ── Upcoming Events Management ─────────────────────────────────────────

    const eventFileInput = document.getElementById('event-image');
    const eventFileNameDisplay = document.getElementById('event-file-name');
    const eventForm = document.getElementById('event-form');
    const eventAlertBox = document.getElementById('event-alert-message');
    const eventSubmitBtn = document.getElementById('event-submit-btn');
    const eventsListContainer = document.getElementById('events-list-container');

    if (eventFileInput) {
        eventFileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                eventFileNameDisplay.textContent = e.target.files[0].name;
                eventFileNameDisplay.style.color = 'var(--primary-blue)';
                eventFileNameDisplay.style.fontWeight = '600';
            } else {
                eventFileNameDisplay.textContent = 'Drag and drop an image or click to browse';
                eventFileNameDisplay.style.color = 'inherit';
                eventFileNameDisplay.style.fontWeight = 'normal';
            }
        });
    }

    if (eventForm) {
        eventForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            eventAlertBox.style.display = 'none';
            eventAlertBox.className = 'alert';

            const originalText = eventSubmitBtn.textContent;
            eventSubmitBtn.textContent = 'Adding Event...';
            eventSubmitBtn.disabled = true;

            try {
                const formData = new FormData(eventForm);
                const response = await fetch('/api/events', {
                    method: 'POST',
                    body: formData
                });
                const result = await response.json();

                if (response.ok) {
                    showEventAlert('Event added successfully!', 'success');
                    eventForm.reset();
                    eventFileNameDisplay.textContent = 'Drag and drop an image or click to browse';
                    eventFileNameDisplay.style.color = 'inherit';
                    eventFileNameDisplay.style.fontWeight = 'normal';
                    fetchEvents();
                } else {
                    showEventAlert(result.error || 'Failed to add event.', 'error');
                }
            } catch (error) {
                console.error('Event add error:', error);
                showEventAlert('A network error occurred. Please try again.', 'error');
            } finally {
                eventSubmitBtn.textContent = originalText;
                eventSubmitBtn.disabled = false;
            }
        });
    }

    function showEventAlert(message, type) {
        eventAlertBox.textContent = message;
        eventAlertBox.className = `alert alert-${type}`;
        eventAlertBox.style.display = 'block';
    }

    async function fetchEvents() {
        if (!eventsListContainer) return;

        try {
            const response = await fetch('/api/events');
            const result = await response.json();

            if (response.ok) {
                renderEvents(result.data);
            } else {
                eventsListContainer.innerHTML = `<p style="text-align: center; color: var(--text-light);">Failed to load events.</p>`;
            }
        } catch (error) {
            console.error('Error fetching events:', error);
            eventsListContainer.innerHTML = `<p style="text-align: center; color: var(--text-light);">Error loading events.</p>`;
        }
    }

    function renderEvents(events) {
        if (!events || events.length === 0) {
            eventsListContainer.innerHTML = `<p style="text-align: center; color: var(--text-light);">No events found.</p>`;
            return;
        }

        eventsListContainer.innerHTML = '';
        events.forEach(event => {
            const item = document.createElement('div');
            item.className = 'activity-item';

            const imageUrl = event.image_path || 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2060%2060%22%20preserveAspectRatio%3D%22none%22%3E%3Crect%20width%3D%2260%22%20height%3D%2260%22%20fill%3D%22%23eee%22%3E%3C%2Frect%3E%3Ctext%20x%3D%225%22%20y%3D%2235%22%20fill%3D%22%23999%22%20style%3D%22font-size%3A10px%22%3ENo%20Img%3C%2Ftext%3E%3C%2Fsvg%3E';

            item.innerHTML = `
                <img src="${imageUrl}" alt="${event.title}">
                <div class="activity-item-content">
                    <div class="activity-item-title">${event.title}</div>
                    <div class="activity-item-date">${event.date} | ${event.location}</div>
                </div>
                <button class="btn-delete btn-delete-event" data-id="${event.id}">Delete</button>
            `;

            eventsListContainer.appendChild(item);
        });

        eventsListContainer.querySelectorAll('.btn-delete-event').forEach(btn => {
            btn.addEventListener('click', handleEventDelete);
        });
    }

    async function handleEventDelete(e) {
        const id = e.target.getAttribute('data-id');
        if (!confirm('Are you sure you want to delete this event?')) return;

        try {
            const response = await fetch(`/api/events/${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                showEventAlert('Event deleted successfully!', 'success');
                fetchEvents();
            } else {
                const result = await response.json();
                showEventAlert(result.error || 'Failed to delete event.', 'error');
            }
        } catch (error) {
            console.error('Delete error:', error);
            showEventAlert('A network error occurred. Please try again.', 'error');
        }
    }

    // Initial fetch for events
    fetchEvents();

    // ── Contact Information Management ─────────────────────────────────────

    const contactForm = document.getElementById('contact-form');
    const contactAlertBox = document.getElementById('contact-alert-message');
    const contactSubmitBtn = document.getElementById('contact-submit-btn');

    if (contactForm) {
        // Fetch current contact info on load
        async function fetchContactInfo() {
            try {
                const response = await fetch('/api/contact');
                const result = await response.json();
                if (response.ok && result.data) {
                    const info = result.data;
                    document.getElementById('contact-email').value = info.email || '';
                    document.getElementById('contact-phone').value = info.phone || '';
                    document.getElementById('contact-instagram-url').value = info.instagram_url || '';
                    document.getElementById('contact-instagram-handle').value = info.instagram_handle || '';
                }
            } catch (error) {
                console.error('Error fetching contact info:', error);
            }
        }

        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            contactAlertBox.style.display = 'none';
            contactAlertBox.className = 'alert';

            const originalText = contactSubmitBtn.textContent;
            contactSubmitBtn.textContent = 'Updating...';
            contactSubmitBtn.disabled = true;

            const contactData = {
                email: document.getElementById('contact-email').value,
                phone: document.getElementById('contact-phone').value,
                instagram_url: document.getElementById('contact-instagram-url').value,
                instagram_handle: document.getElementById('contact-instagram-handle').value
            };

            try {
                const response = await fetch('/api/contact', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(contactData)
                });
                const result = await response.json();

                if (response.ok) {
                    showContactAlert('Contact information updated successfully!', 'success');
                } else {
                    showContactAlert(result.error || 'Failed to update contact info.', 'error');
                }
            } catch (error) {
                console.error('Contact update error:', error);
                showContactAlert('A network error occurred. Please try again.', 'error');
            } finally {
                contactSubmitBtn.textContent = originalText;
                contactSubmitBtn.disabled = false;
            }
        });

        function showContactAlert(message, type) {
            contactAlertBox.textContent = message;
            contactAlertBox.className = `alert alert-${type}`;
            contactAlertBox.style.display = 'block';
        }

        fetchContactInfo();
    }

    // ── Execom Photo Management ────────────────────────────────────────────

    const execomFileInput = document.getElementById('execom-image');
    const execomFileNameDisplay = document.getElementById('execom-file-name');
    const execomForm = document.getElementById('execom-form');
    const execomAlertBox = document.getElementById('execom-alert-message');
    const execomSubmitBtn = document.getElementById('execom-submit-btn');
    const execomListContainer = document.getElementById('execom-list-container');

    if (execomFileInput) {
        execomFileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                execomFileNameDisplay.textContent = e.target.files[0].name;
                execomFileNameDisplay.style.color = 'var(--primary-blue)';
                execomFileNameDisplay.style.fontWeight = '600';
            } else {
                execomFileNameDisplay.textContent = 'Drag and drop a photo or click to browse';
                execomFileNameDisplay.style.color = 'inherit';
                execomFileNameDisplay.style.fontWeight = 'normal';
            }
        });
    }

    if (execomForm) {
        execomForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            execomAlertBox.style.display = 'none';
            execomAlertBox.className = 'alert';

            const originalText = execomSubmitBtn.textContent;
            execomSubmitBtn.textContent = 'Uploading...';
            execomSubmitBtn.disabled = true;

            try {
                const formData = new FormData(execomForm);
                const response = await fetch('/api/execom-photos', {
                    method: 'POST',
                    body: formData
                });
                const result = await response.json();

                if (response.ok) {
                    showExecomAlert('Execom photo uploaded successfully!', 'success');
                    execomForm.reset();
                    execomFileNameDisplay.textContent = 'Drag and drop a photo or click to browse';
                    execomFileNameDisplay.style.color = 'inherit';
                    execomFileNameDisplay.style.fontWeight = 'normal';
                    fetchExecomPhotos();
                } else {
                    showExecomAlert(result.error || 'Failed to upload photo.', 'error');
                }
            } catch (error) {
                console.error('Execom upload error:', error);
                showExecomAlert('A network error occurred. Please try again.', 'error');
            } finally {
                execomSubmitBtn.textContent = originalText;
                execomSubmitBtn.disabled = false;
            }
        });
    }

    function showExecomAlert(message, type) {
        execomAlertBox.textContent = message;
        execomAlertBox.className = `alert alert-${type}`;
        execomAlertBox.style.display = 'block';
    }

    async function fetchExecomPhotos() {
        if (!execomListContainer) return;
        try {
            const response = await fetch('/api/execom-photos');
            const result = await response.json();
            if (response.ok) {
                renderExecomPhotos(result.data);
            } else {
                execomListContainer.innerHTML = `<p style="text-align:center;color:var(--text-light);">Failed to load Execom photos.</p>`;
            }
        } catch (error) {
            execomListContainer.innerHTML = `<p style="text-align:center;color:var(--text-light);">Error loading Execom photos.</p>`;
        }
    }

    function renderExecomPhotos(photos) {
        if (!photos || photos.length === 0) {
            execomListContainer.innerHTML = `<p style="text-align:center;color:var(--text-light);">No Execom photos found.</p>`;
            return;
        }
        execomListContainer.innerHTML = '';
        photos.forEach(photo => {
            const date = new Date(photo.created_at).toLocaleDateString();
            const item = document.createElement('div');
            item.className = 'activity-item';
            item.innerHTML = `
                <img src="${photo.image_path}" alt="${photo.caption || 'Execom photo'}">
                <div class="activity-item-content">
                    <div class="activity-item-title">${photo.caption || '<em style="color:var(--text-light);">No caption</em>'}</div>
                    <div class="activity-item-date">Added: ${date}</div>
                </div>
                <button class="btn-delete" data-id="${photo.id}">Delete</button>
            `;
            execomListContainer.appendChild(item);
        });

        execomListContainer.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', handleExecomDelete);
        });
    }

    async function handleExecomDelete(e) {
        const id = e.target.getAttribute('data-id');
        if (!confirm('Are you sure you want to delete this Execom photo?')) return;
        try {
            const response = await fetch(`/api/execom-photos/${id}`, { method: 'DELETE' });
            if (response.ok) {
                showExecomAlert('Execom photo deleted successfully!', 'success');
                fetchExecomPhotos();
            } else {
                const result = await response.json();
                showExecomAlert(result.error || 'Failed to delete photo.', 'error');
            }
        } catch (error) {
            showExecomAlert('A network error occurred. Please try again.', 'error');
        }
    }

    // Initial fetch for execom photos
    fetchExecomPhotos();
});

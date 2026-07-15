// Map Application Logic
const API_URL = '/api/maps/';
const INITIAL_MAP = 'saudi_main';

// DOM Elements
const elements = {
    wrapper: document.getElementById('map-wrapper'),
    background: document.getElementById('map-background'),
    pinsContainer: document.getElementById('pins-container'),
    loader: document.getElementById('map-loader'),
    btnBack: document.getElementById('btn-back'),
    modal: document.getElementById('info-modal'),
    modalBackdrop: document.getElementById('modal-backdrop'),
    modalClose: document.getElementById('btn-close-modal'),
    modalBody: document.getElementById('modal-body'),
};

// State
let currentMapId = null;
let mapHistory = []; // Stack to keep track of previous maps
let isAnimating = false;

// Initialization
async function init() {
    setupEventListeners();
    await loadMap(INITIAL_MAP, false);
    
    // Initial history state
    history.replaceState({ mapId: INITIAL_MAP }, '', `?map=${INITIAL_MAP}`);
}

// Event Listeners
function setupEventListeners() {
    elements.btnBack.addEventListener('click', goBack);
    elements.modalClose.addEventListener('click', closeModal);
    elements.modalBackdrop.addEventListener('click', closeModal);
    
    // Dynamic recalculation of the map bounds to ensure 0-drift pins
    window.addEventListener('resize', calculateMapBounds);
    
    // Handle browser back button natively
    window.addEventListener('popstate', async (event) => {
        if (event.state && event.state.mapId) {
            const prevMapId = event.state.mapId;
            if (mapHistory.length > 0 && mapHistory[mapHistory.length - 1] === prevMapId) {
                mapHistory.pop();
            }
            await loadMap(prevMapId, false, true);
        }
    });
}

// Function to calculate exact bounds of the image for perfect pin locking
function calculateMapBounds() {
    if (!elements.background.src || elements.background.naturalWidth === 0) return;

    const imgWidth = elements.background.naturalWidth;
    const imgHeight = elements.background.naturalHeight;
    const imgAspect = imgWidth / imgHeight;

    // Use viewport dimensions (with a small safety margin on desktop)
    const isMobile = window.innerWidth < 768;
    const margin = isMobile ? 1 : 0.95; 
    
    const viewportWidth = window.innerWidth * margin;
    const viewportHeight = window.innerHeight * margin;
    const viewportAspect = viewportWidth / viewportHeight;

    let finalWidth, finalHeight;

    if (viewportAspect > imgAspect) {
        // Height is the constraint
        finalHeight = viewportHeight;
        finalWidth = finalHeight * imgAspect;
    } else {
        // Width is the constraint
        finalWidth = viewportWidth;
        finalHeight = finalWidth / imgAspect;
    }

    // Apply explicit dimensions to wrapper
    elements.wrapper.style.width = `${finalWidth}px`;
    elements.wrapper.style.height = `${finalHeight}px`;
}

// Load a map by ID
async function loadMap(mapId, pushToHistory = true, isBackAction = false) {
    if (isAnimating || currentMapId === mapId) return;
    
    isAnimating = true;
    showLoader();
    closeModal(); // Ensure any open modal is closed on transition

    try {
        const response = await fetch(`${API_URL}${mapId}`);
        if (!response.ok) throw new Error('Map data not found');
        
        const mapData = await response.json();
        
        // Fade out current view if not the first load
        if (currentMapId) {
            await gsap.to(elements.wrapper, { opacity: 0, duration: 0.4, ease: 'power2.inOut' });
        }

        // Render new map data
        renderMap(mapData);

        // Update history tracking
        if (pushToHistory && currentMapId) {
            mapHistory.push(currentMapId);
            history.pushState({ mapId: mapId }, '', `?map=${mapId}`);
        }
        
        currentMapId = mapId;
        updateBackButtonVisibility();

        const finalizeLoad = async () => {
            calculateMapBounds(); // Apply explicit CSS width/height
            
            // Reset scale and transform-origin before fading in
            gsap.set(elements.wrapper, { scale: 1, x: 0, y: 0, transformOrigin: '50% 50%' });
            
            // Fade in
            await gsap.to(elements.wrapper, { opacity: 1, duration: 0.5, ease: 'power2.inOut' });
            
            hideLoader();
            isAnimating = false;
        };

        if (elements.background.complete && elements.background.naturalWidth !== 0) {
            await finalizeLoad();
        } else {
            elements.background.onload = finalizeLoad;
        }
        
    } catch (error) {
        console.error('Error loading map:', error);
        alert('Harita yüklenirken bir hata oluştu.');
        hideLoader();
        isAnimating = false;
    } 
}

// Render map background and pins
function renderMap(data) {
    // Clear old pins
    elements.pinsContainer.innerHTML = '';

    // Set background image (triggers onload inside loadMap)
    elements.background.src = data.backgroundImage;
    elements.background.onerror = () => {
        const title = encodeURIComponent(data.backgroundImage.replace('/images/', ''));
        elements.background.src = `data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%221200%22%20height%3D%22900%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20fill%3D%22%231e293b%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20font-size%3D%2224%22%20text-anchor%3D%22middle%22%20fill%3D%22%2394a3b8%22%3EPlaceholder%3A%20${title}%3C%2Ftext%3E%3C%2Fsvg%3E`;
    };

    // Create new pins
    data.pins.forEach(pin => {
        const pinElement = document.createElement('div');
        pinElement.className = `map-pin pin-type-${pin.type}`;
        pinElement.style.left = `${pin.x_percent}%`;
        pinElement.style.top = `${pin.y_percent}%`;
        
        // Inner HTML - ONLY the marker now, no text labels
        pinElement.innerHTML = `
            <div class="pin-marker"></div>
        `;

        // Click handler
        pinElement.addEventListener('click', (e) => handlePinClick(e, pin));

        elements.pinsContainer.appendChild(pinElement);
    });
}

// Handle pin clicks
function handlePinClick(event, pin) {
    if (isAnimating) return;

    if (pin.type === 'info') {
        openModal(pin.content);
    } else if (pin.type === 'zoom_map') {
        performZoomTransition(pin);
    }
}

// GSAP Zoom Transition Logic
async function performZoomTransition(pin) {
    isAnimating = true;

    const originX = pin.x_percent;
    const originY = pin.y_percent;

    // Set origin to the pin's exact percentage
    gsap.set(elements.wrapper, { transformOrigin: `${originX}% ${originY}%` });

    // Animate zoom in and fade out container slightly
    await gsap.to(elements.wrapper, {
        scale: 3.5, 
        opacity: 0, 
        duration: 1.1,
        ease: 'power3.inOut'
    });

    // Proceed to load the sub-map
    isAnimating = false; // Reset to allow loadMap to take over
    await loadMap(pin.targetMap, true);
}

// Go back to previous map
async function goBack() {
    if (isAnimating || mapHistory.length === 0) return;
    history.back(); // Natively trigger popstate
}

// Update back button visibility
function updateBackButtonVisibility() {
    if (currentMapId !== INITIAL_MAP) {
        elements.btnBack.classList.remove('hidden');
    } else {
        elements.btnBack.classList.add('hidden');
    }
}

// Premium Modal Logic
function openModal(content) {
    elements.modalBody.innerHTML = content;
    document.body.classList.add('modal-open');
}

function closeModal() {
    document.body.classList.remove('modal-open');
}

// UI Utilities
function showLoader() {
    elements.loader.style.display = 'flex';
}

function hideLoader() {
    // handled internally in the onload logic now
    elements.loader.style.display = 'none';
}

// Start application
document.addEventListener('DOMContentLoaded', init);

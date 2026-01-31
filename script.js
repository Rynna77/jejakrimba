// script.js - FINAL VERSION

document.addEventListener("DOMContentLoaded", () => {
    
    // 1. PAGE TRANSITION
    const transitionOverlay = document.querySelector(".page-transition");
    if(transitionOverlay && typeof gsap !== 'undefined') {
        gsap.to(transitionOverlay, {
            opacity: 0, duration: 0.8, ease: "power2.inOut",
            onComplete: () => { transitionOverlay.style.display = "none"; }
        });
    }

    // 2. LENIS SCROLL (Hanya Smooth Scroll, tanpa blur background utama)
    if (typeof Lenis !== 'undefined') {
        const lenis = new Lenis({
            duration: 1.2, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            smooth: true,
        });

        function raf(time) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);
    }

    // 3. SIDEBAR NAVIGATION
    const hamburger = document.querySelector(".hamburger");
    const sidebar = document.querySelector(".sidebar");
    const overlay = document.querySelector(".sidebar-overlay");
    const closeBtn = document.querySelector(".close-btn");
    const sidebarLinks = document.querySelectorAll(".sidebar-links a");

    window.closeMenu = function() {
        if(sidebar) sidebar.classList.remove("active");
        if(overlay) overlay.classList.remove("active");
    }

    function openMenu() {
        if(sidebar) sidebar.classList.add("active");
        if(overlay) overlay.classList.add("active");
    }

    if(hamburger) hamburger.addEventListener("click", openMenu);
    if(closeBtn) closeBtn.addEventListener("click", closeMenu);
    if(overlay) overlay.addEventListener("click", closeMenu);

    // 4. ANIMASI GSAP
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);
        
        if(document.querySelector(".anim-text")) {
            gsap.fromTo(".anim-text", 
                { y: 30, opacity: 0, autoAlpha: 0 }, 
                { y: 0, opacity: 1, autoAlpha: 1, duration: 1.5, stagger: 0.3, ease: "power3.out", delay: 0.5 }
            );
        }
        
        const revealElements = document.querySelectorAll(".reveal-type");
        revealElements.forEach(element => {
            gsap.fromTo(element, 
                { y: 50, opacity: 0 },
                {
                    y: 0, opacity: 1, duration: 1, ease: "power3.out",
                    scrollTrigger: { trigger: element, start: "top 85%", toggleActions: "play none none reverse" }
                }
            );
        });
    }

    // 5. NAVBAR SCROLL EFFECT
    const navbar = document.querySelector('.navbar');
    if(navbar) {
        window.addEventListener('scroll', () => {
            if(window.scrollY > 50) navbar.classList.add('scrolled');
            else navbar.classList.remove('scrolled');
        });
    }

    // 6. PETA
    const mapElement = document.getElementById('map');
    if (mapElement && typeof L !== 'undefined') {
        const map = L.map('map').setView([-7.942493, 112.953012], 10);
        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; CARTO', maxZoom: 19
        }).addTo(map);
        L.marker([-7.942493, 112.953012]).addTo(map).bindPopup("<b>Gunung Bromo</b>").openPopup();
    }

    // 7. CUACA
    const API_KEY = 'bd5e378503939ddaee76f12ad7a97608'; 

    window.getLocation = function() {
        resetUI();
        if (navigator.geolocation) {
            document.getElementById('loading').style.display = 'block';
            navigator.geolocation.getCurrentPosition(
                pos => fetchWeather(pos.coords.latitude, pos.coords.longitude, 'coords'),
                err => {
                    document.getElementById('loading').style.display = 'none';
                    showError("Gagal mendeteksi lokasi.");
                }
            );
        } else { showError("Browser tidak support GPS."); }
    };

    window.getWeatherByCity = function() {
        const city = document.getElementById('cityInput').value;
        if(!city) { alert("Masukkan nama kota!"); return; }
        resetUI();
        document.getElementById('loading').style.display = 'block';
        fetchWeather(city, null, 'city');
    };

    function resetUI() {
        document.getElementById('loading').style.display = 'none';
        document.getElementById('errorMsg').style.display = 'none';
        document.getElementById('weatherResult').style.display = 'none';
    }

    async function fetchWeather(p1, p2, type) {
        let url = type === 'coords' 
            ? `https://api.openweathermap.org/data/2.5/weather?lat=${p1}&lon=${p2}&appid=${API_KEY}&units=metric&lang=id`
            : `https://api.openweathermap.org/data/2.5/weather?q=${p1}&appid=${API_KEY}&units=metric&lang=id`;

        try {
            const response = await fetch(url);
            const data = await response.json();
            if (data.cod !== 200) throw new Error("Lokasi tidak ditemukan");

            document.getElementById('wTemp').innerText = Math.round(data.main.temp) + "°C";
            document.getElementById('wDesc').innerText = data.weather[0].description;
            if(document.getElementById('wCity')) document.getElementById('wCity').innerText = data.name;
            const icon = document.getElementById('wIcon');
            icon.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@4x.png`;
            if(document.getElementById('wWind')) document.getElementById('wWind').innerText = data.wind.speed + " m/s";
            if(document.getElementById('wHum')) document.getElementById('wHum').innerText = data.main.humidity + "%";

            document.getElementById('loading').style.display = 'none';
            document.getElementById('weatherResult').style.display = 'block';
        } catch (err) { 
            document.getElementById('loading').style.display = 'none';
            showError(err.message); 
        }
    }

    function showError(msg) {
        const errorMsg = document.getElementById('errorMsg');
        errorMsg.style.display = 'block';
        errorMsg.innerText = msg;
    }
});

// script.js - VERSI FINAL (ANTI-ERROR)

document.addEventListener("DOMContentLoaded", () => {
    
    // --- 1. SETUP LENIS (SMOOTH SCROLL) ---
    // Cek library Lenis ada atau tidak
    if (typeof Lenis !== 'undefined') {
        const lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            smooth: true,
        });
        function raf(time) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);
    }

    // --- 2. SETUP ANIMASI GSAP ---
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);

        // Parallax Background (Cek dulu elemennya ada ga)
        if(document.querySelector(".parallax-bg")) {
            gsap.to(".parallax-bg", {
                scrollTrigger: {
                    trigger: "body", // Trigger dari body agar aman
                    start: "top top",
                    end: "bottom top",
                    scrub: true
                },
                yPercent: 30,
                scale: 1.1
            });
        }

        // Animasi Reveal
        const revealElements = document.querySelectorAll(".reveal-type");
        revealElements.forEach(element => {
            gsap.fromTo(element, 
                { y: 50, opacity: 0 },
                {
                    y: 0, opacity: 1, duration: 1, ease: "power3.out",
                    scrollTrigger: {
                        trigger: element,
                        start: "top 85%",
                        toggleActions: "play none none reverse"
                    }
                }
            );
        });

        // Animasi Teks Hero
        if(document.querySelector(".anim-text")) {
            gsap.from(".anim-text", {
                y: 30, opacity: 0, duration: 1.5, stagger: 0.2, ease: "power3.out"
            });
        }
    }

    // --- 3. LOGIKA NAVBAR SCROLL ---
    const navbar = document.querySelector('.navbar');
    if(navbar) {
        window.addEventListener('scroll', () => {
            if(window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
    }

    // --- 4. SETUP PETA (Hanya Jalankan Jika Ada ID 'map') ---
    const mapElement = document.getElementById('map');
    if (mapElement && typeof L !== 'undefined') {
        const map = L.map('map').setView([-7.942493, 112.953012], 10);
        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; CARTO',
            maxZoom: 19
        }).addTo(map);
        L.marker([-7.942493, 112.953012]).addTo(map).bindPopup("<b>Gunung Bromo</b>").openPopup();
    }

    // --- 5. LOGIKA CUACA (Hanya Jalankan Jika Ada Widget Cuaca) ---
    const weatherWidget = document.getElementById('weatherResult');
    if (weatherWidget) {
        const API_KEY = 'bd5e378503939ddaee76f12ad7a97608';
        const loading = document.getElementById('loading');
        const errorMsg = document.getElementById('errorMsg');
        const weatherResult = document.getElementById('weatherResult');

        // Jadikan fungsi global agar bisa dipanggil onclick di HTML
        window.getLocation = function() {
            loading.classList.remove('hidden');
            errorMsg.classList.add('hidden');
            weatherResult.classList.add('hidden');
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    pos => fetchWeather(pos.coords.latitude, pos.coords.longitude, 'coords'),
                    err => showError("Gagal mendeteksi lokasi.")
                );
            } else {
                showError("Browser tidak support GPS.");
            }
        };

        window.getWeatherByCity = function() {
            const city = document.getElementById('cityInput').value;
            if(!city) return;
            loading.classList.remove('hidden');
            errorMsg.classList.add('hidden');
            weatherResult.classList.add('hidden');
            fetchWeather(city, null, 'city');
        };

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
                document.getElementById('wCity').innerText = data.name;
                document.getElementById('wWind').innerText = data.wind.speed + " m/s";
                document.getElementById('wHum').innerText = data.main.humidity + "%";
                document.getElementById('wIcon').src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;

                loading.classList.add('hidden');
                weatherResult.classList.remove('hidden');
            } catch (err) {
                showError(err.message);
            }
        }

        function showError(msg) {
            loading.classList.add('hidden');
            errorMsg.classList.remove('hidden');
            errorMsg.innerText = msg;
        }
    }

    // --- 6. INTERAKSI SUARA & BURUNG (Untuk Destinasi Page) ---
    // Fungsi ini dipanggil via onclick di HTML, jadi harus nempel di window
    // --- 6. INTERAKSI SUARA & BURUNG (Update Banyak Burung) ---
    // --- 6. INTERAKSI SUARA & BURUNG ---
    window.triggerEffect = function() {
        // Mainkan Suara
        const audio = document.getElementById('nature-sound');
        if (audio) {
            audio.currentTime = 0;
            audio.volume = 0.5;
            audio.play().catch(e => console.log("Audio perlu interaksi user dulu"));
        }
        
        // Animasi Burung SVG
        if(typeof gsap !== 'undefined') {
            gsap.set(".flying-bird", { x: 0, opacity: 0 }); // Reset dulu

            gsap.to(".flying-bird", {
                x: window.innerWidth + 200, // Terbang ke kanan
                opacity: 0.9,
                duration: "random(4, 6)", // Kecepatan acak
                stagger: 0.2, // Terbang berurutan
                ease: "power1.inOut",
                onComplete: () => {
                    gsap.set(".flying-bird", { opacity: 0 }); // Sembunyi lagi
                }
            });
        }
    };



    // --- 7. LOGIKA HAMBURGER MENU (DITARUH PALING BAWAH AGAR AMAN) ---
    const hamburger = document.querySelector(".hamburger");
    const navMenu = document.querySelector(".nav-links");

    if(hamburger && navMenu) {
        // Hapus event listener lama (clean up) lalu tambah baru
        const toggleMenu = () => {
            hamburger.classList.toggle("active");
            navMenu.classList.toggle("active");
        };

        hamburger.removeEventListener("click", toggleMenu); // Jaga-jaga
        hamburger.addEventListener("click", toggleMenu);

        document.querySelectorAll(".nav-links a").forEach(n => 
            n.addEventListener("click", () => {
                hamburger.classList.remove("active");
                navMenu.classList.remove("active");
            })
        );
    }
});

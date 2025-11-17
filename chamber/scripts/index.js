(async function(){
    const DATA_URL = 'data/members.json';
    const spotlightsEl = document.getElementById('spotlights-grid');
    const eventsEl = document.getElementById('events-list');
    const currentWeatherEl = document.getElementById('current-weather-box');
    const forecastWeatherEl = document.getElementById('forecast-weather-box');

    async function fetchMembers(){
        try{
            const res = await fetch(DATA_URL);
            if(!res.ok) throw new Error('Failed to fetch members');
            return await res.json();
        }catch(err){
            console.error(err);
            return [];
        }
    }

    function createSpotlightCard(member){
        const div = document.createElement('article');
        div.className = 'member-card';

        const media = document.createElement('div');
        media.className = 'card-media';
        const img = document.createElement('img');
        // use placehold.co if local image not present
        img.src = `https://placehold.co/600x350/0A5873/FFFFFF?text=${encodeURIComponent(member.name)}`;
        img.alt = member.name;
        img.loading = 'lazy';
        img.width = 600; img.height = 350;
        media.appendChild(img);

        const body = document.createElement('div');
        body.className = 'card-body';
        const h3 = document.createElement('h3'); h3.textContent = member.name;
        const cat = document.createElement('p'); cat.className = 'member-category'; cat.textContent = `${member.category} · ${membershipLabel(member.membership_level)}`;
        const desc = document.createElement('p'); desc.className = 'member-desc'; desc.textContent = member.description;
        const contact = document.createElement('p'); contact.className = 'member-contact'; contact.innerHTML = `${member.address}<br><a href="tel:${member.phone}">${member.phone}</a>`;
        const links = document.createElement('p'); links.className = 'member-links'; links.innerHTML = member.websites.map(w=>`<a href="${w}" target="_blank" rel="noopener">${displayDomain(w)}</a>`).join(' | ');

        body.appendChild(h3);
        body.appendChild(cat);
        body.appendChild(desc);
        body.appendChild(contact);
        body.appendChild(links);

        div.appendChild(media);
        div.appendChild(body);
        return div;
    }

    function membershipLabel(level){
        switch(level){case 3: return 'Gold'; case 2: return 'Silver'; default: return 'Member';}
    }

    function displayDomain(url){try{const u=new URL(url);return u.hostname.replace('www.','');}catch(e){return url}}

    function renderEvents(){
        const demo = [
            {id:'evt1', title:'Chamber Networking Breakfast', date:'2025-12-04', location:'Harbor Hall'},
            {id:'evt2', title:'Small Business Workshop: Social Media', date:'2025-12-12', location:'Online'},
        ];
        eventsEl.innerHTML = '';
        demo.forEach(ev=>{
            const d = document.createElement('div');
            d.className = 'event-item';
            d.style.marginBottom = '0.75rem';
            d.innerHTML = `<strong>${ev.title}</strong><div class="muted">${ev.date} — ${ev.location}</div>`;
            eventsEl.appendChild(d);
        });
    }

    function renderCurrentWeather(){
        // simulated current weather
        const w = {location:'Harborview', temp:67, condition:'Partly cloudy', feels_like:66, humidity:58};
        if(!currentWeatherEl) return;
        currentWeatherEl.innerHTML = `
            <div><strong>${w.location}</strong></div>
            <div style="margin-top:0.5rem;"><span style="font-size:1.5rem;font-weight:600;">${w.temp}°F</span> — <span class="muted">${w.condition}</span></div>
            <div class="muted" style="margin-top:0.5rem;">Feels like ${w.feels_like}° • Humidity ${w.humidity}%</div>
        `;
    }

    function renderForecastWeather(){
        const forecast = [
            {day:'Tomorrow', high:70, low:58, cond:'Partly cloudy'},
            {day:'Day 2', high:68, low:56, cond:'Sunny'},
            {day:'Day 3', high:65, low:54, cond:'Showers'},
        ];
        if(!forecastWeatherEl) return;
        forecastWeatherEl.innerHTML = '';
        const list = document.createElement('div');
        list.style.display = 'grid';
        list.style.gridTemplateColumns = '1fr';
        list.style.gap = '0.5rem';
        forecast.forEach(f=>{
            const item = document.createElement('div');
            item.style.padding = '0.5rem';
            item.style.background = 'var(--color-surface)';
            item.style.borderRadius = '6px';
            item.style.boxShadow = 'var(--shadow-1)';
            item.innerHTML = `<strong>${f.day}</strong><div class=\"muted\">${f.cond} — High ${f.high}° • Low ${f.low}°</div>`;
            list.appendChild(item);
        });
        forecastWeatherEl.appendChild(list);
    }

    // main init
    const members = await fetchMembers();
    renderEvents();
    renderCurrentWeather();
    renderForecastWeather();

    // pick spotlights: first fill with membership_level 3 (Gold), then 2 (Silver), then fallback
    const gold = members.filter(m=>m.membership_level===3);
    const silver = members.filter(m=>m.membership_level===2);
    const rest = members.filter(m=>m.membership_level!==3 && m.membership_level!==2);
    const pick = [...gold, ...silver, ...rest].slice(0,3);

    spotlightsEl.innerHTML = '';
    pick.forEach((m,i)=>{
        const card = createSpotlightCard(m);
        if(i===0){
            const img = card.querySelector('img'); if(img){img.loading='eager'; try{img.setAttribute('fetchpriority','high')}catch(e){}
            }
        }
        spotlightsEl.appendChild(card);
    });

})();

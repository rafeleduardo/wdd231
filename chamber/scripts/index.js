(async function(){
    const DATA_URL = 'data/members.json';
    const spotlightsEl = document.getElementById('spotlights-grid');
    const eventsEl = document.getElementById('events-list');
    const currentWeatherEl = document.getElementById('current-weather-box');
    const forecastWeatherEl = document.getElementById('forecast-weather-box');

    async function fetchMembers(){
        try{
            const res = await fetch(DATA_URL);
            if(!res.ok){
                console.error('Failed to fetch members', res.status);
                return [];
            }
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

    const FORECAST_URL = 'https://api.openweathermap.org/data/2.5/forecast?q=Gothenburg,se&units=metric&APPID=f1d94aa39619b6b6a1b11f9bb21d66d5';
    const CURRENT_URL = 'https://api.openweathermap.org/data/2.5/weather?q=Gothenburg,se&units=metric&APPID=f1d94aa39619b6b6a1b11f9bb21d66d5';

    async function fetchForecastSimple(){
        const res = await fetch(FORECAST_URL);
        if(!res.ok){
            const txt = await res.text().catch(()=>res.statusText);
            throw new Error(`Weather API error: ${res.status} ${txt}`);
        }
        return await res.json();
    }

    async function fetchCurrentSimple(){
        const res = await fetch(CURRENT_URL);
        if(!res.ok){
            const txt = await res.text().catch(()=>res.statusText);
            throw new Error(`Weather API error: ${res.status} ${txt}`);
        }
        return await res.json();
    }

    function groupDailySimple(list){
        const byDate = {};
        list.forEach(it=>{
            const d = it.dt_txt.split(' ')[0];
            if(!byDate[d]) byDate[d] = [];
            byDate[d].push(it);
        });
        const dates = Object.keys(byDate).sort();
        return dates.map(date=>{
            const items = byDate[date];
            const temps = items.map(i=>i.main.temp);
            const high = Math.round(Math.max(...temps));
            const low = Math.round(Math.min(...temps));
            const descItem = items.find(i=>i.dt_txt.includes('12:00:00')) || items[Math.floor(items.length/2)];
            const desc = descItem && descItem.weather && descItem.weather[0] ? descItem.weather[0].description : '';
            const icon = descItem && descItem.weather && descItem.weather[0] ? descItem.weather[0].icon : '';
            return {date, high, low, desc, icon};
        });
    }

    function renderCurrentFromCurrentAPI(data){
        if(!currentWeatherEl) return;
        try{
            const temp = data && data.main ? Math.round(data.main.temp) : 'N/A';
            const desc = data && data.weather && data.weather[0] ? data.weather[0].description : '';
            const icon = data && data.weather && data.weather[0] ? data.weather[0].icon : '';
            const city = data && data.name ? data.name : 'Gothenburg';
            const tempMax = data && data.main && typeof data.main.temp_max !== 'undefined' ? Math.round(data.main.temp_max) : null;
            const tempMin = data && data.main && typeof data.main.temp_min !== 'undefined' ? Math.round(data.main.temp_min) : null;
            const humidity = data && data.main && typeof data.main.humidity !== 'undefined' ? data.main.humidity : null;
            const sunrise = data && data.sys && data.sys.sunrise ? new Date(data.sys.sunrise * 1000) : null;
            const sunset = data && data.sys && data.sys.sunset ? new Date(data.sys.sunset * 1000) : null;

            const iconHtml = icon ? `<img class="cw-icon" src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="${desc}">` : '';

            const timeOptions = { hour: '2-digit', minute: '2-digit' };
            const sunriseStr = sunrise ? sunrise.toLocaleTimeString(undefined, timeOptions) : 'N/A';
            const sunsetStr = sunset ? sunset.toLocaleTimeString(undefined, timeOptions) : 'N/A';

            currentWeatherEl.innerHTML = `\n                <div><strong>${city}</strong></div>\n                <div class="cw-main">${iconHtml}<div><span class=\"cw-temp\">${temp}\u00b0C</span> <div class=\"cw-desc muted\">${desc ? (desc.charAt(0).toUpperCase()+desc.slice(1)) : 'N/A'}</div></div></div>\n                <div class=\"cw-row\">\n                    <div class=\"cw-item\"><span class=\"muted\">High</span><span class=\"cw-value\">${tempMax !== null ? tempMax + '\u00b0' : 'N/A'}</span></div>\n                    <div class=\"cw-item\"><span class=\"muted\">Low</span><span class=\"cw-value\">${tempMin !== null ? tempMin + '\u00b0' : 'N/A'}</span></div>\n                    <div class=\"cw-item\"><span class=\"muted\">Humidity</span><span class=\"cw-value\">${humidity !== null ? humidity + '%' : 'N/A'}</span></div>\n                    <div class=\"cw-item\"><span class=\"muted\">Sunrise</span><span class=\"cw-value\">${sunriseStr}</span></div>\n                    <div class=\"cw-item\"><span class=\"muted\">Sunset</span><span class=\"cw-value\">${sunsetStr}</span></div>\n                </div>\n            `;
        }catch(e){
            currentWeatherEl.textContent = 'Unable to render current weather.';
            console.error(e);
        }
    }

    function renderSimple3Day(data){
        if(!forecastWeatherEl) return;
        const list = data.list || [];
        if(!list.length){ forecastWeatherEl.textContent = 'No forecast data available.'; return; }
        const daily = groupDailySimple(list);
        const today = new Date().toISOString().split('T')[0];
        const nextDays = daily.filter(d=>d.date > today).slice(0,3);
        if(!nextDays.length){ forecastWeatherEl.textContent = 'No 3-day forecast available.'; return; }

        forecastWeatherEl.innerHTML = '';
        const listEl = document.createElement('div');
        listEl.className = 'forecast-list';

        nextDays.forEach(d=>{
            const dt = new Date(d.date + 'T12:00:00');
            const dayLabel = dt.toLocaleDateString(undefined,{weekday:'short', month:'short', day:'numeric'});
            const iconHtml = d.icon ? `<img class="forecast-icon" src="https://openweathermap.org/img/wn/${d.icon}@2x.png" alt="${d.desc}">` : '';
            const item = document.createElement('div');
            item.className = 'forecast-item';
            item.innerHTML = `<strong>${dayLabel}</strong><div class="muted">${iconHtml}${d.desc.charAt(0).toUpperCase()+d.desc.slice(1)}</div><div class="forecast-temp">High ${d.high}\u00b0 \u2022 Low ${d.low}\u00b0</div>`;
            listEl.appendChild(item);
        });

        forecastWeatherEl.appendChild(listEl);
    }

    async function loadWeather(){
        if(!currentWeatherEl && !forecastWeatherEl) return;
        try{
            if(currentWeatherEl) currentWeatherEl.textContent = 'Loading current weather...';
            if(forecastWeatherEl) forecastWeatherEl.textContent = 'Loading forecast...';
            const [currentData, forecastData] = await Promise.all([fetchCurrentSimple(), fetchForecastSimple()]);
            renderCurrentFromCurrentAPI(currentData);
            renderSimple3Day(forecastData);
        }catch(err){
            console.error(err);
            const msg = err && err.message ? err.message : 'Unable to load weather.';
            if(currentWeatherEl) currentWeatherEl.textContent = msg;
            if(forecastWeatherEl) forecastWeatherEl.textContent = msg;
        }
    }

    // main init
    const members = await fetchMembers();
    renderEvents();
    await loadWeather();

    const gold = members.filter(m=>m.membership_level===3);
    const silver = members.filter(m=>m.membership_level===2);
    const pool = [...gold, ...silver];

    function shuffleArray(arr){
        const a = arr.slice();
        for(let i=a.length-1;i>0;i--){
            const j = Math.floor(Math.random()*(i+1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    }

    const shuffled = shuffleArray(pool);
    let pick = shuffled.slice(0,3);

    if(pick.length < 3){
        const others = members.filter(m=>m.membership_level!==3 && m.membership_level!==2 && !pick.includes(m));
        for(const o of others){
            if(pick.length>=3) break;
            pick.push(o);
        }
    }

    pick = pick.filter((v,i,self)=>self.indexOf(v)===i).slice(0,3);

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

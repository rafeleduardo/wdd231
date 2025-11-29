(async function(){
    const DATA_URL = 'data/members.json';
    const listingsEl = document.getElementById('directory-listings');
    const btnCards = document.getElementById('view-cards');
    const btnList = document.getElementById('view-list');
    const searchInput = document.getElementById('directory-search');
    const clearBtn = document.getElementById('directory-clear');

    let members = [];
    let currentView = 'cards'; // default

    async function fetchMembers(){
        try{
            const res = await fetch(DATA_URL);
            if(!res.ok) {
                console.error('Failed to fetch members:', res.status);
                listingsEl.innerHTML = '<p>Error loading directory data.</p>';
                return;
            }
            members = await res.json();
        } catch(err){
            console.error(err);
            listingsEl.innerHTML = '<p>Error loading directory data.</p>';
        }
    }

    function createImage(src, alt, width, height, options={}){
        const img = new Image(width, height);
        img.src = `images/${src}`;
        img.alt = alt || '';
        img.loading = options.loading || 'lazy';
        img.decoding = 'async';
        if(options.fetchpriority){
            try { img.setAttribute('fetchpriority', options.fetchpriority); } catch(e) {}
        }
        return img;
    }

    function createCard(member, isFirst=false){
        const div = document.createElement('article');
        div.className = 'member-card';

        const media = document.createElement('div');
        media.className = 'card-media';
        const img = createImage(
            member.image,
            member.name,
            760,
            440,
            isFirst ? { loading: 'eager', fetchpriority: 'high' } : { loading: 'lazy' }
        );
        media.appendChild(img);

        const body = document.createElement('div');
        body.className = 'card-body';

        const h3 = document.createElement('h3');
        h3.className = 'member-name';
        h3.textContent = member.name;

        const cat = document.createElement('p');
        cat.className = 'member-category';
        cat.innerHTML = `${member.category} &middot; ${membershipLabel(member.membership_level)}`;

        const desc = document.createElement('p');
        desc.className = 'member-desc';
        desc.textContent = member.description;

        const contact = document.createElement('p');
        contact.className = 'member-contact';
        contact.innerHTML = `${member.address}<br><a href="tel:${member.phone}">${member.phone}</a>`;

        const links = document.createElement('p');
        links.className = 'member-links';
        links.innerHTML = member.websites.map(w => `<a href="${w}" target="_blank" rel="noopener">${displayDomain(w)}</a>`).join(' | ');

        body.appendChild(h3);
        body.appendChild(cat);
        body.appendChild(desc);
        body.appendChild(contact);
        body.appendChild(links);

        div.appendChild(media);
        div.appendChild(body);
        return div;
    }

    function createListItem(member, isFirst=false){
        const wrapper = document.createElement('div');
        wrapper.className = 'member-list-item';

        const media = document.createElement('div');
        media.className = 'list-media';
        const img = createImage(
            member.image,
            member.name,
            64,
            64,
            isFirst ? { loading: 'eager', fetchpriority: 'high' } : { loading: 'lazy' }
        );
        media.appendChild(img);

        const body = document.createElement('div');
        body.className = 'list-body';
        const h3 = document.createElement('h3');
        h3.innerHTML = `${member.name} <small class="muted">&middot; ${membershipLabel(member.membership_level)}</small>`;
        const meta = document.createElement('p');
        meta.className = 'muted';
        meta.textContent = `${member.category} — ${member.address}`;
        const desc = document.createElement('p');
        desc.textContent = member.description;

        body.appendChild(h3);
        body.appendChild(meta);
        body.appendChild(desc);

        wrapper.appendChild(media);
        wrapper.appendChild(body);
        return wrapper;
    }

    function membershipLabel(level){
        switch(level){
            case 3: return 'Gold';
            case 2: return 'Silver';
            default: return 'Member';
        }
    }

    function displayDomain(url){
        try{ const u = new URL(url); return u.hostname.replace('www.',''); }catch(e){return url}
    }

    function render(filtered){
        const heading = listingsEl.querySelector('h2');
        if(!filtered || filtered.length === 0){
            const empty = document.createElement('div');
            empty.className = 'empty-state';
            empty.setAttribute('role','status');
            empty.textContent = 'No results. Try another term or category.';
            if(heading){
                listingsEl.replaceChildren(heading, empty);
            } else {
                listingsEl.replaceChildren(empty);
            }
        } else {
            const frag = document.createDocumentFragment();
            if(currentView === 'cards'){
                const grid = document.createElement('div');
                grid.className = 'cards-grid';
                filtered.forEach((m,i) => grid.appendChild(createCard(m, i===0)));
                frag.appendChild(grid);
            } else {
                const list = document.createElement('div');
                list.className = 'list-wrap';
                filtered.forEach((m,i) => list.appendChild(createListItem(m, i===0)));
                frag.appendChild(list);
            }
            if(heading){
                listingsEl.replaceChildren(heading, frag);
            } else {
                listingsEl.replaceChildren(frag);
            }
        }

        listingsEl.classList.remove('loading');
        listingsEl.removeAttribute('aria-busy');
        listingsEl.classList.remove('directory-cards','directory-list');
        listingsEl.classList.add(currentView === 'cards' ? 'directory-cards' : 'directory-list');
    }

    function applySearch(){
        const q = (searchInput.value || '').toLowerCase().trim();
        if(!q) return members.slice();
        return members.filter(m => (
            m.name.toLowerCase().includes(q) ||
            (m.category && m.category.toLowerCase().includes(q)) ||
            (m.services && m.services.join(' ').toLowerCase().includes(q))
        ));
    }

    function activateTab(tab){
        const isCards = tab === btnCards;
        currentView = isCards ? 'cards' : 'list';

        btnCards.classList.toggle('active', isCards);
        btnList.classList.toggle('active', !isCards);

        btnCards.setAttribute('aria-selected', isCards ? 'true' : 'false');
        btnList.setAttribute('aria-selected', isCards ? 'false' : 'true');
        btnCards.setAttribute('tabindex', isCards ? '0' : '-1');
        btnList.setAttribute('tabindex', isCards ? '-1' : '0');
        tab.focus();
        render(applySearch());
    }

    btnCards.addEventListener('click', ()=> activateTab(btnCards));
    btnList.addEventListener('click', ()=> activateTab(btnList));

    const viewToggle = document.querySelector('.view-toggle');
    viewToggle.addEventListener('keydown', (e)=>{
        const keys = ['ArrowLeft','ArrowRight','Home','End','Enter',' '];
        if(!keys.includes(e.key)) return;
        const tabs = [btnCards, btnList];
        const currentIndex = tabs.indexOf(document.activeElement);
        let newIndex = -1;
        if(e.key === 'ArrowLeft') newIndex = (currentIndex <= 0) ? tabs.length - 1 : currentIndex - 1;
        if(e.key === 'ArrowRight') newIndex = (currentIndex === tabs.length - 1) ? 0 : currentIndex + 1;
        if(e.key === 'Home') newIndex = 0;
        if(e.key === 'End') newIndex = tabs.length - 1;
        if(e.key === 'Enter' || e.key === ' ') {
            const focused = document.activeElement;
            if(tabs.includes(focused)){
                e.preventDefault();
                activateTab(focused);
            }
            return;
        }
        if(newIndex >= 0){
            e.preventDefault();
            const target = tabs[newIndex];
            target.focus();
        }
    });

    searchInput.addEventListener('input', ()=>{
        render(applySearch());
    });

    clearBtn?.addEventListener('click', ()=>{
        searchInput.value = '';
        searchInput.focus();
        render(members.slice());
    });

    // init
    await fetchMembers();
    render(members);
})();

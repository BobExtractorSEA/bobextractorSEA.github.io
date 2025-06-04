
// ──────────────────────────────────────────────────────────────
//  JavaScript
// ──────────────────────────────────────────────────────────────

var currentlyPlaying = null;
var currentButton = null;

function toggleAudio(audioId, button) {
    var audio = document.getElementById(audioId);
    if (!audio) {
        console.error('Audio element not found:', audioId);
        return false;
    }

    if (currentlyPlaying && currentlyPlaying !== audio) {
        currentlyPlaying.pause();
        currentlyPlaying.currentTime = 0;
        if (currentButton) {
            currentButton.classList.remove('playing');
            currentButton.innerHTML = '<i class="fas fa-play"></i>';
            var oldTimeDisplay = currentButton.parentNode.querySelector('.audio-time');
            if (oldTimeDisplay) oldTimeDisplay.textContent = '0:00';
        }
    }

    if (audio.paused) {
        audio.play().catch(error => console.error('Error playing audio:', error));
        button.classList.add('playing');
        button.innerHTML = '<i class="fas fa-pause"></i>';

        var timeDisplay = button.parentNode.querySelector('.audio-time');
        var updateTime = () => {
            if (!audio.paused) {
                var m = Math.floor(audio.currentTime / 60);
                var s = Math.floor(audio.currentTime % 60);
                if (timeDisplay) timeDisplay.textContent = m + ':' + (s < 10 ? '0' : '') + s;
            }
        };
        audio.addEventListener('timeupdate', updateTime);
        audio.addEventListener('ended', () => {
            button.classList.remove('playing');
            button.innerHTML = '<i class="fas fa-play"></i>';
            if (timeDisplay) timeDisplay.textContent = '0:00';
            currentlyPlaying = null;
            currentButton = null;
            audio.removeEventListener('timeupdate', updateTime);
        });

        currentlyPlaying = audio;
        currentButton = button;
    } else {
        audio.pause();
        button.classList.remove('playing');
        button.innerHTML = '<i class="fas fa-play"></i>';
        currentlyPlaying = null;
        currentButton = null;
    }
    return false;
}

function showJsonModal(skillId) {
    var modal       = document.getElementById('jsonModal');
    var jsonContent = document.getElementById('jsonContent');
    if (!modal || !jsonContent) return;

    fetch('Skills/' + skillId + '.json')
        .then(r => r.json())
        .then(data => {
            jsonContent.textContent = JSON.stringify(data, null, 2);
            new bootstrap.Modal(modal).show();
        })
        .catch(err => {
            jsonContent.textContent = 'Error loading data: ' + err.message;
            new bootstrap.Modal(modal).show();
        });
}

function openAnimationModal(src, caption) {
    var modal = document.getElementById('animationModal');
    var img   = document.getElementById('modalAnimationImg');
    var txt   = document.getElementById('animationCaption');
    if (!modal || !img || !txt) return;
    modal.style.display = 'block';
    img.src = src;
    txt.innerHTML = caption;
    document.body.style.overflow = 'hidden';
}

function closeAnimationModal() {
    var modal = document.getElementById('animationModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

function voteForSkill(skillId) {
    const btn   = document.querySelector(`.vote-btn[onclick*="${skillId}"]`);
    const count = document.getElementById(`vote-count-${skillId}`);
    if (!btn || !count) return;

    const voted = JSON.parse(localStorage.getItem('votedSkills') || '{}');
    const cur   = parseInt(count.textContent || '0');

    if (voted[skillId]) {
        delete voted[skillId];
        btn.classList.remove('voted');
        count.textContent = Math.max(0, cur - 1);
    } else {
        voted[skillId] = true;
        btn.classList.add('voted');
        count.textContent = cur + 1;
    }
    localStorage.setItem('votedSkills', JSON.stringify(voted));
}

document.addEventListener('DOMContentLoaded', () => {
    const wrappers     = document.querySelectorAll('.skill-card-wrapper');
    const statusPills  = document.querySelectorAll('.status-pill');
    const jobPills     = document.querySelectorAll('.job-pill');
    const searchInput  = document.getElementById('search-input');
    const searchBtn    = document.getElementById('search-btn');
    const visibleCount = document.getElementById('visible-count');
    const loadMoreBtn  = document.getElementById('load-more-btn');

    let filters   = ['added', 'changed', 'removed'];
    let query     = '';
    let selected  = '';
    let loaded    = 15;
    let maxVisible = 15;
    const total   = loadMoreBtn ? parseInt(loadMoreBtn.getAttribute('data-total-cards')) : 0;

    statusPills.forEach(p => p.addEventListener('click', () => {
        const f = p.getAttribute('data-filter').toLowerCase();
        p.classList.toggle('active');
        filters = [...document.querySelectorAll('.status-pill.active')].map(x => x.getAttribute('data-filter').toLowerCase());
        filterSkills();
    }));

    jobPills.forEach(p => p.addEventListener('click', () => {
        jobPills.forEach(x => x.classList.remove('active'));
        p.classList.add('active');
        selected = p.getAttribute('data-job');
        maxVisible = 15;
        updateLoadMoreButton();
        filterSkills();
    }));

    const doSearch = () => { 
        query = (searchInput.value || '').toLowerCase().trim(); 
        maxVisible = 15;
        updateLoadMoreButton();
        filterSkills(); 
    };
    if (searchBtn)   searchBtn.addEventListener('click', doSearch);
    if (searchInput) searchInput.addEventListener('keyup', e => { if (e.key === 'Enter') doSearch(); });

    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', () => {
            const spinner = loadMoreBtn.querySelector('.spinner-border');
            const batchSize = parseInt(loadMoreBtn.getAttribute('data-batch-size')) || 15;
            
            if (spinner) spinner.classList.remove('d-none');
            loadMoreBtn.disabled = true;

            setTimeout(() => {
                maxVisible += batchSize;
                
                if (spinner) spinner.classList.add('d-none');
                loadMoreBtn.disabled = false;
                updateLoadMoreButton();
                filterSkills()
            }, 300);
        });
    }

    const themeToggle = document.getElementById('themeToggle');
    const html        = document.documentElement;
    const savedTheme  = localStorage.getItem('theme');
    if (savedTheme === 'dark') { html.classList.add('dark-theme'); if (themeToggle) themeToggle.innerHTML = '<i class="fas fa-sun"></i>'; }
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const dark = html.classList.toggle('dark-theme');
            localStorage.setItem('theme', dark ? 'dark' : 'light');
            themeToggle.innerHTML = dark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
        });
    }

    const animationModal = document.getElementById('animationModal');
    const animationModalClose = document.querySelector('.animation-modal-close');

    if (animationModalClose) {
        animationModalClose.addEventListener('click', closeAnimationModal);
    }

    if (animationModal) {
        animationModal.addEventListener('click', function(event) {
            if (event.target === animationModal) {
                closeAnimationModal();
            }
        });
    }

    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            closeAnimationModal();
        }
    });

    filterSkills();

    function updateLoadMoreButton() {
        if (!loadMoreBtn) return;

        let totalFiltered = 0;
        wrappers.forEach(w => {
            const c  = w.querySelector('.skill-card');
            const ty = c.getAttribute('data-skill-type').toLowerCase();
            const nm = c.getAttribute('data-skill-name').toLowerCase();
            const id = c.getAttribute('data-skill-id').toLowerCase();
            const jb = c.getAttribute('data-skill-job').toLowerCase();

            const matchesFilter = filters.includes(ty) &&
                                 (selected === '' || jb === selected.toLowerCase()) &&
                                 (query === '' || nm.includes(query) || id.includes(query) || jb.includes(query));
            
            if (matchesFilter) totalFiltered++;
        });

        if (maxVisible >= totalFiltered) {
            if (loadMoreBtn.parentNode) loadMoreBtn.parentNode.style.display = 'none';
        } else {
            if (loadMoreBtn.parentNode) loadMoreBtn.parentNode.style.display = 'block';
        }
    }

    function filterSkills() {
        let visible = 0;
        let shown = 0;
        
        wrappers.forEach(w => {
            const c  = w.querySelector('.skill-card');
            const ty = c.getAttribute('data-skill-type').toLowerCase();
            const nm = c.getAttribute('data-skill-name').toLowerCase();
            const id = c.getAttribute('data-skill-id').toLowerCase();
            const jb = c.getAttribute('data-skill-job').toLowerCase();

            const matchesFilter = filters.includes(ty) &&
                                 (selected === '' || jb === selected.toLowerCase()) &&
                                 (query === '' || nm.includes(query) || id.includes(query) || jb.includes(query));

            if (matchesFilter) {
                visible++;
                 if (shown < maxVisible) {
                    w.style.display = '';
                    w.classList.remove('lazy-card');
                    shown++;
                } else {
                    w.style.display = 'none';
                    w.classList.add('lazy-card');
                }
            } else {
                w.style.display = 'none';
            }
        });
        
        if (visibleCount) visibleCount.textContent = visible;
        updateLoadMoreButton();
    }
    const voted = JSON.parse(localStorage.getItem('votedSkills') || '{}');
    document.querySelectorAll('.vote-btn').forEach(btn => {
        const attr  = btn.getAttribute('onclick') || '';
        const m     = attr.match(/voteForSkill\s*\(\s*['"]([^'"]+)['"]/);
        if (m && voted[m[1]]) btn.classList.add('voted');
    });
});

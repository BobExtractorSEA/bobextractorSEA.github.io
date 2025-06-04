
// ============================================
// MOB-SPECIFIC JS
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    var wrappers = document.querySelectorAll('.mob-card-wrapper');
    var statusPills = document.querySelectorAll('.status-pill');
    var levelPills = document.querySelectorAll('.level-pill');
    var searchInput = document.getElementById('search-input');
    var searchBtn = document.getElementById('search-btn');
    var visibleCount = document.getElementById('visible-count');
    var loadMoreBtn = document.getElementById('load-more-btn');

    var filters = ['added', 'changed', 'removed'];
    var query = '';
    var levelMin = 0;
    var levelMax = 999;
    var maxVisible = 15;
    var total = loadMoreBtn ? parseInt(loadMoreBtn.getAttribute('data-total-cards')) : 0;

    // Status filters
    statusPills.forEach(function(p) {
        p.addEventListener('click', function() {
            p.classList.toggle('active');
            var activeElements = document.querySelectorAll('.status-pill.active');
            filters = [];
            for (var i = 0; i < activeElements.length; i++) {
                filters.push(activeElements[i].getAttribute('data-filter').toLowerCase());
            }
            maxVisible = 15;
            updateLoadMoreButton();
            filterMobs();
        });
    });

    // Level filters
    levelPills.forEach(function(p) {
        p.addEventListener('click', function() {
            levelPills.forEach(function(x) { x.classList.remove('active'); });
            p.classList.add('active');
            levelMin = parseInt(p.getAttribute('data-level-min'));
            levelMax = parseInt(p.getAttribute('data-level-max'));
            maxVisible = 15;
            updateLoadMoreButton();
            filterMobs();
        });
    });

    // Search
    var doSearch = function() {
        query = (searchInput.value || '').toLowerCase().trim();
        maxVisible = 15;
        updateLoadMoreButton();
        filterMobs();
    };
    if (searchBtn) searchBtn.addEventListener('click', doSearch);
    if (searchInput) {
        searchInput.addEventListener('keyup', function(e) { 
            if (e.key === 'Enter') doSearch(); 
        });
    }

    // Load more mobs
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', function() {
            var spinner = loadMoreBtn.querySelector('.spinner-border');
            var batchSize = parseInt(loadMoreBtn.getAttribute('data-batch-size')) || 15;
            
            if (spinner) spinner.classList.remove('d-none');
            loadMoreBtn.disabled = true;

            setTimeout(function() {
                maxVisible += batchSize;
                if (spinner) spinner.classList.add('d-none');
                loadMoreBtn.disabled = false;
                updateLoadMoreButton();
                filterMobs();
            }, 300);
        });
    }

// Mob tabs system
window.switchMobTab = function(btn, tabName, mobId) {
    // Remove active class from all tabs
    var tabBtns = btn.parentElement.querySelectorAll('.mob-tab-btn');
    tabBtns.forEach(function(b) { b.classList.remove('active'); });
    
    // Add active to clicked tab
    btn.classList.add('active');
    
    // Hide all tab contents
    var baseContent = document.getElementById('mob-tab-base-' + mobId);
    var othersContent = document.getElementById('mob-tab-others-' + mobId);
    
    if (baseContent) baseContent.style.display = 'none';
    if (othersContent) othersContent.style.display = 'none';
    
    // Show selected tab
    var selectedContent = document.getElementById('mob-tab-' + tabName + '-' + mobId);
    if (selectedContent) selectedContent.style.display = 'block';
};

    // Animation modal
    window.openAnimationModal = function(src, caption) {
        var modal = document.getElementById('animationModal');
        var img = document.getElementById('modalAnimationImg');
        var txt = document.getElementById('animationCaption');
        if (!modal || !img || !txt) return;
        modal.style.display = 'block';
        img.src = src;
        txt.innerHTML = caption;
        document.body.style.overflow = 'hidden';
    };

    window.closeAnimationModal = function() {
        var modal = document.getElementById('animationModal');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    };

    // Close modal events
    var animationModal = document.getElementById('animationModal');
    var animationModalClose = document.querySelector('.animation-modal-close');

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

    // Show JSON Modal
    window.showJsonModal = function(mobId) {
        var modal = document.getElementById('jsonModal');
        var jsonContent = document.getElementById('jsonContent');
        if (!modal || !jsonContent) return;

        fetch('Mobs/' + mobId + '.json')
            .then(function(r) { return r.json(); })
            .then(function(data) {
                jsonContent.textContent = JSON.stringify(data, null, 2);
                new bootstrap.Modal(modal).show();
            })
            .catch(function(err) {
                jsonContent.textContent = 'Error loading data: ' + err.message;
                new bootstrap.Modal(modal).show();
            });
    };

    // Voting system
    window.voteForMob = function(mobId) {
        var btn = document.querySelector('.vote-btn[onclick*="' + mobId + '"]');
        var count = document.getElementById('vote-count-' + mobId);
        if (!btn || !count) return;

        var voted = JSON.parse(localStorage.getItem('votedMobs') || '{}');
        var cur = parseInt(count.textContent || '0');

        if (voted[mobId]) {
            delete voted[mobId];
            btn.classList.remove('voted');
            count.textContent = Math.max(0, cur - 1);
        } else {
            voted[mobId] = true;
            btn.classList.add('voted');
            count.textContent = cur + 1;
        }
        localStorage.setItem('votedMobs', JSON.stringify(voted));
    };

    // Update Load More button
    function updateLoadMoreButton() {
        if (!loadMoreBtn) return;
        
        var totalFiltered = 0;
        wrappers.forEach(function(w) {
            if (!w) return;
            
            var ty = w.getAttribute('data-mob-type');
            var nm = w.getAttribute('data-mob-name');
            var id = w.getAttribute('data-mob-id');
            var lv = parseInt(w.getAttribute('data-mob-level')) || 0;
            
            if (!ty || !nm || !id) return;
            
            var matchesFilter = filters.indexOf(ty.toLowerCase()) !== -1 &&
                               lv >= levelMin && lv <= levelMax &&
                               (query === '' || nm.toLowerCase().indexOf(query) !== -1 || 
                                id.toLowerCase().indexOf(query) !== -1);
            
            if (matchesFilter) totalFiltered++;
        });
        
        if (maxVisible >= totalFiltered) {
            if (loadMoreBtn.parentNode) loadMoreBtn.parentNode.style.display = 'none';
        } else {
            if (loadMoreBtn.parentNode) loadMoreBtn.parentNode.style.display = 'block';
        }
    }

    // Filter function
    function filterMobs() {
        var visible = 0;
        var shown = 0;
        
        wrappers.forEach(function(w) {
            if (!w) return;
            
            var ty = w.getAttribute('data-mob-type');
            var nm = w.getAttribute('data-mob-name');
            var id = w.getAttribute('data-mob-id');
            var lv = parseInt(w.getAttribute('data-mob-level')) || 0;
            
            if (!ty || !nm || !id) {
                w.style.display = 'none';
                return;
            }
            
            var matchesFilter = filters.indexOf(ty.toLowerCase()) !== -1 &&
                               lv >= levelMin && lv <= levelMax &&
                               (query === '' || nm.toLowerCase().indexOf(query) !== -1 || 
                                id.toLowerCase().indexOf(query) !== -1);

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

    // Mark existing votes
    var voted = JSON.parse(localStorage.getItem('votedMobs') || '{}');
    document.querySelectorAll('.vote-btn').forEach(function(btn) {
        var attr = btn.getAttribute('onclick') || '';
        var m = attr.match(/voteForMob\s*\(\s*['"]([^'"]+)['"]/);
        if (m && voted[m[1]]) btn.classList.add('voted');
    });

    // Apply filters initially
    filterMobs();
});
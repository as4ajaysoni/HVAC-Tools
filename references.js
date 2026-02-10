// References.js - Interactive formula displays and navigation

document.addEventListener('DOMContentLoaded', function() {
    // Smooth scroll to formula sections
    const formulaSections = document.querySelectorAll('.formula-section h2, .formula-section h3');
    
    formulaSections.forEach(section => {
        section.style.cursor = 'pointer';
        section.addEventListener('click', function() {
            // Create a subtle highlight effect
            this.style.backgroundColor = '#e3f2fd';
            setTimeout(() => {
                this.style.backgroundColor = '';
            }, 1000);
        });
    });
    
    // Add formula copy functionality
    const formulas = document.querySelectorAll('.formula');
    
    formulas.forEach(formula => {
        // Add copy button to each formula
        const copyBtn = document.createElement('button');
        copyBtn.textContent = '📋 Copy';
        copyBtn.style.cssText = `
            position: absolute;
            top: 5px;
            right: 5px;
            background: #3498db;
            color: white;
            border: none;
            padding: 5px 10px;
            border-radius: 3px;
            cursor: pointer;
            font-size: 0.8rem;
            opacity: 0;
            transition: opacity 0.3s;
        `;
        
        formula.style.position = 'relative';
        formula.appendChild(copyBtn);
        
        // Show/hide copy button on hover
        formula.addEventListener('mouseenter', () => {
            copyBtn.style.opacity = '1';
        });
        
        formula.addEventListener('mouseleave', () => {
            copyBtn.style.opacity = '0';
        });
        
        // Copy formula to clipboard
        copyBtn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const formulaText = formula.textContent.replace('📋 Copy', '').trim();
            
            try {
                await navigator.clipboard.writeText(formulaText);
                copyBtn.textContent = '✓ Copied!';
                copyBtn.style.backgroundColor = '#27ae60';
                
                setTimeout(() => {
                    copyBtn.textContent = '📋 Copy';
                    copyBtn.style.backgroundColor = '#3498db';
                }, 2000);
            } catch (err) {
                console.error('Failed to copy formula:', err);
                copyBtn.textContent = '✗ Failed';
                copyBtn.style.backgroundColor = '#e74c3c';
                
                setTimeout(() => {
                    copyBtn.textContent = '📋 Copy';
                    copyBtn.style.backgroundColor = '#3498db';
                }, 2000);
            }
        });
    });
    
    // Add interactive constant table highlighting
    const constantTable = document.querySelector('.constant-table');
    if (constantTable) {
        const rows = constantTable.querySelectorAll('tbody tr');
        
        rows.forEach(row => {
            row.addEventListener('mouseenter', function() {
                this.style.backgroundColor = '#e3f2fd';
                this.style.transform = 'scale(1.02)';
                this.style.transition = 'all 0.3s ease';
                this.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
            });
            
            row.addEventListener('mouseleave', function() {
                this.style.backgroundColor = '';
                this.style.transform = '';
                this.style.boxShadow = '';
            });
        });
    }
    
    // Add search functionality
    const searchDiv = document.createElement('div');
    searchDiv.style.cssText = `
        margin-bottom: 30px;
        text-align: center;
    `;
    
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = 'Search formulas and references...';
    searchInput.style.cssText = `
        width: 100%;
        max-width: 500px;
        padding: 12px;
        border: 2px solid #ddd;
        border-radius: 25px;
        font-size: 1rem;
        outline: none;
        transition: border-color 0.3s;
    `;
    
    searchInput.addEventListener('focus', () => {
        searchInput.style.borderColor = '#3498db';
    });
    
    searchInput.addEventListener('blur', () => {
        searchInput.style.borderColor = '#ddd';
    });
    
    searchDiv.appendChild(searchInput);
    
    // Insert search box after header
    const header = document.querySelector('header');
    header.insertAdjacentElement('afterend', searchDiv);
    
    // Search functionality
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        const sections = document.querySelectorAll('.formula-section');
        
        sections.forEach(section => {
            const text = section.textContent.toLowerCase();
            const shouldShow = searchTerm === '' || text.includes(searchTerm);
            
            if (shouldShow) {
                section.style.display = 'block';
                section.style.opacity = '1';
            } else {
                section.style.opacity = '0.3';
            }
        });
        
        // Highlight search terms
        if (searchTerm) {
            highlightSearchTerms(searchTerm);
        } else {
            removeHighlights();
        }
    });
    
    // Search term highlighting
    function highlightSearchTerms(term) {
        removeHighlights(); // Remove previous highlights
        
        const walker = document.createTreeWalker(
            document.body,
            NodeFilter.SHOW_TEXT,
            null,
            false
        );
        
        const textNodes = [];
        let node;
        while (node = walker.nextNode()) {
            if (node.nodeValue.toLowerCase().includes(term)) {
                textNodes.push(node);
            }
        }
        
        textNodes.forEach(node => {
            const span = document.createElement('span');
            const text = node.nodeValue;
            const regex = new RegExp(`(${escapeRegExp(term)})`, 'gi');
            span.innerHTML = text.replace(regex, '<mark>$1</mark>');
            node.parentNode.replaceChild(span, node);
        });
    }
    
    function removeHighlights() {
        const highlights = document.querySelectorAll('mark');
        highlights.forEach(mark => {
            const parent = mark.parentNode;
            parent.replaceChild(document.createTextNode(mark.textContent), mark);
            parent.normalize();
        });
    }
    
    function escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
    
    // Add formula expansion/collapse for mobile
    if (window.innerWidth <= 768) {
        const sections = document.querySelectorAll('.formula-section');
        
        sections.forEach(section => {
            const title = section.querySelector('h2');
            const content = section.querySelectorAll('h3, .formula, table, .formula-note, .reference-list');
            
            // Initially hide content except title
            content.forEach(el => {
                el.style.display = 'none';
            });
            
            // Add expand/collapse indicator
            const indicator = document.createElement('span');
            indicator.textContent = ' ▼';
            indicator.style.cssText = `
                float: right;
                cursor: pointer;
                transition: transform 0.3s;
            `;
            title.appendChild(indicator);
            
            let isExpanded = false;
            
            title.addEventListener('click', () => {
                isExpanded = !isExpanded;
                
                content.forEach(el => {
                    el.style.display = isExpanded ? 'block' : 'none';
                });
                
                indicator.style.transform = isExpanded ? 'rotate(180deg)' : 'rotate(0)';
            });
        });
    }
    
    // Add keyboard navigation
    document.addEventListener('keydown', function(e) {
        // Press '/' to focus search
        if (e.key === '/' && document.activeElement !== searchInput) {
            e.preventDefault();
            searchInput.focus();
        }
        
        // Press 'Escape' to clear search
        if (e.key === 'Escape' && document.activeElement === searchInput) {
            searchInput.value = '';
            searchInput.dispatchEvent(new Event('input'));
            searchInput.blur();
        }
    });
    
    // Print-friendly version
    const printBtn = document.createElement('button');
    printBtn.textContent = '🖨️ Print Formulas';
    printBtn.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: #2c3e50;
        color: white;
        border: none;
        padding: 10px 15px;
        border-radius: 5px;
        cursor: pointer;
        font-size: 0.9rem;
        z-index: 1000;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        transition: background-color 0.3s;
    `;
    
    printBtn.addEventListener('click', () => {
        window.print();
    });
    
    printBtn.addEventListener('mouseenter', () => {
        printBtn.style.backgroundColor = '#34495e';
    });
    
    printBtn.addEventListener('mouseleave', () => {
        printBtn.style.backgroundColor = '#2c3e50';
    });
    
    document.body.appendChild(printBtn);
    
    // Hide print button in print mode
    const printStyles = document.createElement('style');
    printStyles.textContent = `
        @media print {
            button {
                display: none !important;
            }
            .formula-section {
                break-inside: avoid;
            }
            .back-link {
                display: none;
            }
        }
    `;
    document.head.appendChild(printStyles);
});
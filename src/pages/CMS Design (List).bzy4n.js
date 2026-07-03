import wixData from 'wix-data';

/** @type {ReturnType<typeof setTimeout>} */
let debounceTimer;

const MAX_WORDS = 20; 

$w.onReady(function () {

    $w('#listRepeater').onItemReady(($item, itemData) => {
        let rawText = itemData.description || ""; 
        let wordsArray = rawText.trim().split(/\s+/).filter(word => word.length > 0);
        
        if (wordsArray.length > MAX_WORDS) {
            let truncatedText = wordsArray.slice(0, MAX_WORDS).join(" ") + "...";
            $item('#descriptionText').text = truncatedText;
        } else {
            $item('#descriptionText').text = rawText;
        }
    });

    $w('#dynamicDataset').onReady(() => {
        syncRepeaterWithDataset();
    });
    
    $w('#dynamicDataset').onCurrentIndexChanged(() => {
        syncRepeaterWithDataset();
    });

    $w('#searchBar').onInput(() => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            executeCombinedFilter();
        }, 250);
    });

    $w('#selectionTags1').onChange(() => {
        executeCombinedFilter();
    });
});

function syncRepeaterWithDataset() {
    if (typeof $w('#dynamicDataset').getItems === 'function') {
        $w('#dynamicDataset').getItems(0, 100)
            .then((result) => {
                $w('#listRepeater').data = result.items; 
            })
            .catch((err) => {
                console.error("Error loading dataset items to repeater:", err);
            });
    }
}


function executeCombinedFilter() {
    let searchValue = $w('#searchBar').value;
    let selectedCategories = $w('#selectionTags1').value;

    let compoundFilter = wixData.filter();

    if (searchValue && searchValue.trim() !== "") {
        compoundFilter = compoundFilter.contains('resourceName', searchValue.trim());
    }

    if (selectedCategories && selectedCategories.length > 0) {
        compoundFilter = compoundFilter.hasAll('category', selectedCategories);
    }

    $w('#dynamicDataset').setFilter(compoundFilter);
}
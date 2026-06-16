import wixData from 'wix-data';

/** @type {ReturnType<typeof setTimeout>} */
let debounceTimer;

const MAX_WORDS = 20; 

$w.onReady(function () {

    //textbox setup
    $w('#listRepeater').onItemReady(($item, itemData) => {
        // description change
        let rawText = itemData.description || ""; 
        let wordsArray = rawText.split(/\s+/);
        
        if (wordsArray.length > MAX_WORDS) {
            let truncatedText = wordsArray.slice(0, MAX_WORDS).join(" ") + "...";
            $item('#descriptionText').text = truncatedText;
        } else {
            $item('#descriptionText').text = rawText;
        }
    });

    // refresh
    $w('#dynamicDataset').onReady(() => {
        runTextTruncation();
    });

    $w('#dynamicDataset').onCurrentIndexChanged(() => {
        runTextTruncation();
    });

    // search bar
    $w('#searchBar').onInput(() => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            executeCombinedFilter();
        }, 250);
    });

    // cattegory tags
    $w('#selectionTags1').onChange(() => {
        executeCombinedFilter();
    });
});

/**
 * Grabs the raw data from the dataset array and pushes it to the repeater
 */
function runTextTruncation() {
    // get items
    let datasetItems = $w('#dynamicDataset').getCurrentItem() ? [$w('#dynamicDataset').getCurrentItem()] : [];
    
    // safety
    // @ts-ignore
    if (typeof $w('#dynamicDataset').getItems === 'function') {
        $w('#dynamicDataset').getItems(0, 100)
            .then((result) => {
                $w('#listRepeater').data = result.items;
            });
    }
}

/**
 * Compiles search and categories into one joint query
 */
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
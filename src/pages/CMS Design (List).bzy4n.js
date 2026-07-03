import wixData from 'wix-data';
import { importAllImages } from 'backend/importImages.jsw';
import { timeline } from 'wix-animations';

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

        $item('#text133').html = itemData.hasLanguageTranslation
            ? `<span style="font-size:24px; font-family:Avenir; font-weight:bold; color:#2c5f5f;">☑</span> <span style="font-size:11px; font-family:Avenir; font-weight:bold; color:#2c5f5f;">Language Translation</span>`
            : `<span style="font-size:24px; font-family:Avenir; font-weight:bold; color:#2c5f5f;">☐</span> <span style="font-size:11px; font-family:Avenir; font-weight:bold; color:#2c5f5f;">Language Translation</span>`;

        $item('#text134').html = itemData.referalNeeded
            ? `<span style="font-size:24px; font-family:Avenir; font-weight:bold; color:#2c5f5f;">☑</span> <span style="font-size:11px; font-family:Avenir; font-weight:bold; color:#2c5f5f;">Referral Needed</span>`
            : `<span style="font-size:24px; font-family:Avenir; font-weight:bold; color:#2c5f5f;">☐</span> <span style="font-size:11px; font-family:Avenir; font-weight:bold; color:#2c5f5f;">Referral Needed</span>`;

        $item('#text132').text = "My learner is: " + (itemData.myLearnerIs || "");

        // Fade-in on load
        $item('#container1').style.opacity = "0";
        timeline()
            .add($item('#container1'), { opacity: 1, duration: 600, easing: 'easeOutCirc' })
            .play();

        // Hover grow effect
        $item('#container1').onMouseIn(() => {
            timeline()
                .add($item('#container1'), { scale: 1.03, duration: 200, easing: 'easeOutCirc' })
                .play();
        });

        $item('#container1').onMouseOut(() => {
            timeline()
                .add($item('#container1'), { scale: 1, duration: 200, easing: 'easeOutCirc' })
                .play();
        });
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

    $w('#runImportBtn').onClick(async () => {
        $w('#runImportBtn').label = "Running...";
        const result = await importAllImages();
        console.log(result);
        $w('#runImportBtn').label = "Done - check console";
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
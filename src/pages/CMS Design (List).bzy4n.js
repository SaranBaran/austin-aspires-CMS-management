import wixData from 'wix-data';
import { importAllImages } from 'backend/importImages.jsw';
import { timeline } from 'wix-animations';

/** @type {ReturnType<typeof setTimeout>} */
let debounceTimer;
const MAX_WORDS = 20;

$w.onReady(function () {
    console.log("Page onReady fired");
    timeline()
        .add($w('#text130'), { opacity: 0, duration: 0 })
        .add($w('#text131'), { opacity: 0, duration: 0 })
        .add($w('#searchBarBox'), { opacity: 0, duration: 0 })
        .add($w('#section1'), { opacity: 0, duration: 0 })
        .play();

    timeline()
        .add($w('#text130'), { opacity: 1, duration: 1800, easing: 'easeOutCirc' })
        .add($w('#text131'), { opacity: 1, duration: 1800, easing: 'easeOutCirc' }, 800)
        .add($w('#searchBarBox'), { opacity: 1, duration: 1800, easing: 'easeOutCirc' }, 800)
        .add($w('#section1'), { opacity: 1, duration: 1800, easing: 'easeOutCirc' }, 800)
        .play();

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

        timeline()
            .add($item('#container1'), { opacity: 0, duration: 0 })
            .play();

        $item('#container1').onViewportEnter(() => {
            timeline()
                .add($item('#container1'), { opacity: 1, duration: 900, easing: 'easeInOutQuad' })
                .play();
        });

        $item('#container1').onViewportLeave(() => {
            timeline()
                .add($item('#container1'), { opacity: 0, duration: 900, easing: 'easeInOutQuad' })
                .play();
        });

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
        executeCombinedFilter();
    });

    $w('#searchBar').onInput(() => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            executeCombinedFilter();
        }, 250);
    });

    $w('#categoryDropdown').onChange(() => {
        executeCombinedFilter();
    });

    $w('#serviceDropdown').onChange(() => {
        executeCombinedFilter();
    });

    $w('#learnerDropdown').onChange(() => {
        executeCombinedFilter();
    });

    $w('#runImportBtn').onClick(async () => {
        $w('#runImportBtn').label = "Running...";
        const result = await importAllImages();
        console.log(result);
        $w('#runImportBtn').label = "Done - check console";
    });
});

function executeCombinedFilter() {
    let searchValue = $w('#searchBar').value;
    let selectedCategory = $w('#categoryDropdown').value;
    let selectedService = $w('#serviceDropdown').value;
    let selectedLearner = $w('#learnerDropdown').value;

    console.log("selectedLearner value:", JSON.stringify(selectedLearner));

    wixData.query('Import1')
        .limit(100)
        .find()
        .then((results) => {
            let items = results.items;

            items.slice(0, 5).forEach(item => {
                console.log(`${item.resourceName} category:`, JSON.stringify(item.category));
            });

            if (searchValue && searchValue.trim() !== "") {
                const s = searchValue.trim().toLowerCase();
                items = items.filter(item => (item.resourceName || "").toLowerCase().includes(s));
            }
            if (selectedCategory && selectedCategory !== "All / Clear") {
                items = items.filter(item => (item.category || []).some(c => c.trim() === selectedCategory.trim()));
            }
            if (selectedService && selectedService !== "All / Clear") {
                items = items.filter(item => (item.service || []).some(s => s.trim() === selectedService.trim()));
            }
            if (selectedLearner && selectedLearner !== "All / Clear") {
                items = items.filter(item => (item.category || []).some(c => c.trim() === selectedLearner.trim()));
            }

            $w('#listRepeater').data = items;
        })
        .catch((err) => {
            console.error("Error filtering items:", err);
        });
}
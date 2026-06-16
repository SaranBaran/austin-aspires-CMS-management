import wixData from 'wix-data';

/** @type {ReturnType<typeof setTimeout>} */
let debounceTimer;

const ITEM_HEIGHT = 400; // adjust to your card height
const COLUMNS = 3; // adjust to your columns

$w.onReady(function () {
    $w('#input1').onInput(() => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            let searchValue = $w('#input1').value;

            if (searchValue && searchValue.trim() !== "") {
                $w('#dynamicDataset').setFilter(wixData.filter()
                    .contains('resourceName', searchValue)
                ).then(() => {
                    let count = $w('#dynamicDataset').getTotalCount();
                    let rows = Math.ceil(count / COLUMNS);
                    // @ts-ignore
                    $w('#box1').style.height = (rows * ITEM_HEIGHT) + "px";
                });
            } else {
                $w('#dynamicDataset').setFilter(wixData.filter()).then(() => {
                    let count = $w('#dynamicDataset').getTotalCount();
                    let rows = Math.ceil(count / COLUMNS);
                    // @ts-ignore
                    $w('#box1').style.height = (rows * ITEM_HEIGHT) + "px";
                });
            }
        }, 200);
    });
});
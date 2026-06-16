import wixData from 'wix-data';

let debounceTimer;

$w.onReady(function () {

    $w('#input1').onInput(() => {
        
        // clear timer
        clearTimeout(debounceTimer);
        
        // wait time after text
        debounceTimer = setTimeout(() => {
            let searchValue = $w('#input1').value;
            
            if (searchValue && searchValue.trim() !== "") {
                // Filter 
                $w('#dynamicDataset').setFilter(wixData.filter()
                    .contains('resourceName', searchValue)
                );
            } else {
                // empty show everything
                $w('#dynamicDataset').setFilter(wixData.filter());
            }
        }, 200); 
    });
});
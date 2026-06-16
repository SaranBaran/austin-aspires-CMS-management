import wixData from 'wix-data';

$w.onReady(function () {
    $w('#input1').onInput(() => {
        let searchValue = $w('#input1').value;
        
        $w('#dataset1').setFilter(wixData.filter()
            .contains('cmsFieldName', searchValue) 
        );
    });
});

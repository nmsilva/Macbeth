<?php

/** Include PHPExcel_IOFactory */
require_once dirname(__FILE__) . '/Classes/PHPExcel/IOFactory.php';

$objReader = PHPExcel_IOFactory::createReader('Excel2007');
$objPHPExcel = $objReader->load('MACBETH.xlsx');

$response = Array(
  "success" => true,
);
foreach ($_POST['cells'] as $key => $value) {
  if(is_array($value)){
    $_value = $value;
    $value = '';
    foreach ($_value as $v){
      $value .= $v;
      if ($v != end($_value)){
        $value .= '-';
      }
    }
  } 
  $objPHPExcel->setActiveSheetIndex(0)->setCellValue($key, $value);
}

$objWriter = PHPExcel_IOFactory::createWriter($objPHPExcel, "Excel2007");
$objWriter->save(str_replace('.php', '.xlsx', __FILE__));

$response['file'] = 'export.xlsx';
echo json_encode($response);

?>
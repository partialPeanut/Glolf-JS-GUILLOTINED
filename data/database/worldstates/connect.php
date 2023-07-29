<?php
    $serverName = "localhost";
    $connectionOptions = array(
        "Database" => "WorldStates"
    );
    //Establishes the connection
    $conn = sqlsrv_connect($serverName, $connectionOptions);
    if($conn)
        echo "Connected!"
?>
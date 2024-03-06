import * as curlconverter from "curlconverter";
curlconverter.toJsonString(
  'curl -X POST -d "param1=value1&param2=value2" http://www.example.com/resource',
);

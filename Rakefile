task :server do
    `thin -R static.ru start`
end

task :copy_dependencies do 

    simpleReadiumURL = "https://raw.github.com/readium/Readium-Web-Components/master/epub-modules/release/SimpleReadium.min.js"
    simpleReadiumFilePath = "modules_and_dependencies/SimpleReadium.min.js"
    `curl #{simpleReadiumURL} -o #{simpleReadiumFilePath}`
end
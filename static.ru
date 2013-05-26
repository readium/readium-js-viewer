root=Dir.pwd
#root=File.join Dir.pwd, "readium"
puts ">>> Serving: #{root}"
run Rack::Directory.new("#{root}")

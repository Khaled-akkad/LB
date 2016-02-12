# -*- mode: ruby -*-
# vi: set ft=ruby :

Vagrant.configure(2) do |config|

 config.vm.box = "ubuntu/trusty64"

 config.vm.network "private_network", ip: "192.168.33.90"

  config.vm.provider "virtualbox" do |vb|
   vb.cpus = "4"
   vb.memory = "4096"
  end

  config.vm.provision "shell", inline: <<-SHELL

   #--------VERSIONS----------
       NODE_VERSION="v0.12.7"

   #--------GENERAL-----------

       sudo apt-get update
       apt-get install -y build-essential python wget

   #--------Imagemagick-------
       #requirements
       sudo apt-get install pngnq

           #pngout
           cd /opt
           wget http://static.jonof.id.au/dl/kenutils/pngout-20150319-linux.tar.gz
           tar xvfz pngout-20150319-linux.tar.gz
           cd pngout-20150319-linux/x86_64/
           cp pngout /usr/bin

       #main
       sudo apt-get install -y imagemagick



   #--------OpenSSL----------
       #openssl
       sudo apt-get install -y openssl
       sudo apt-get install -y libssl-dev


       #Skapa secretSettings
       #$ cd settings
       #make decrypt_conf


   #---------NodeJS ------- #TODO: placement of node bin

       #https://nodesource.com/blog/nodejs-v012-iojs-and-the-nodesource-linux-repositories
       curl -sL https://deb.nodesource.com/setup_0.12 | sudo bash -
       sudo apt-get install -y nodejs

   #--------NGINX----------
       sudo apt-get install -y nginx
       mv /etc/nginx/nginx.conf /etc/nginx/nginx.conf.bak
       cp /vagrant/nginx-dev.conf /etc/nginx/nginx.conf

   #------NPM--------
   sudo npm install -g pm2
   sudo npm install -g uglifyjs #needed to be able to build the sh in /build

  SHELL

  config.vm.provision "shell", run:"always", privileged:false, inline: <<-SHELL
       sudo cp /vagrant/nginx-dev.conf /etc/nginx/nginx.conf
       sudo service nginx restart
       cd /vagrant/servers
       pm2 start pm2_development.json
  SHELL

end

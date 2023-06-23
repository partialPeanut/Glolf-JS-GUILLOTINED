var Loader=function()//asset-loading system
{
	this.loadingN=0;
	this.assetsN=0;
	this.assets=[];
	this.assetsLoading=[];
	this.assetsLoaded=[];
	this.domain='';
	this.loaded=0;//callback
	this.doneLoading=0;
	
	this.blank=document.createElement('canvas');
	this.blank.width=8;
	this.blank.height=8;
	this.blank.alt='blank';
	
	this.Load=function(assets)
	{
		for (var i in assets)
		{
			this.loadingN++;
			this.assetsN++;
			if (this.assetsLoading.indexOf(assets[i])==-1 && this.assetsLoaded.indexOf(assets[i])==-1)
			{
				var img=new Image();
				if (!Game.local) img.crossOrigin='anonymous';
				img.alt=assets[i];
				img.onload=bind(this,this.onLoad);
				this.assets[assets[i]]=img;
				this.assetsLoading.push(assets[i]);
				if (assets[i].indexOf('/')!=-1) img.src=assets[i];
				else img.src=this.domain+assets[i];
			}
		}
	}
	this.Replace=function(old,newer)
	{
		if (!this.assets[old]) this.Load([old]);
		var img=new Image();
		if (!Game.local) img.crossOrigin='anonymous';
		if (newer.indexOf('/')!=-1)/*newer.indexOf('http')!=-1 || newer.indexOf('https')!=-1)*/ img.src=newer;
		else img.src=this.domain+newer;
		img.alt=newer;
		img.onload=bind(this,this.onLoad);
		this.assets[old]=img;
	}
	this.onLoadReplace=function()
	{
	}
	this.onLoad=function(e)
	{
		this.assetsLoaded.push(e.target.alt);
		this.assetsLoading.splice(this.assetsLoading.indexOf(e.target.alt),1);
		this.loadingN--;
		if (this.doneLoading==0 && this.loadingN<=0 && this.loaded!=0)
		{
			this.doneLoading=1;
			this.loaded();
		}
	}
	this.waitForLoad=function(assets,callback)
	{
		//execute callback if all assets are ready to use, else check again every 200ms
		var me=this;
		var checkLoadedLoop=function()
		{
			for (var i=0;i<assets.length;i++)
			{
				if (me.assetsLoaded.indexOf(assets[i])==-1) {setTimeout(checkLoadedLoop,200);return false};
			}
			callback();
			return true;
		}
		me.Load(assets);
		checkLoadedLoop();
	}
	this.getProgress=function()
	{
		return (1-this.loadingN/this.assetsN);
	}
}
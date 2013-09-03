# Tree Graph for Broadband Providers

****

### Summary:

+ A standalone demo, will be integrated into [Broadband Map Provider Page](http://www.broadbandmap.gov/about-provider).
+ Some Cleanup needs to be performed on source data, the current code only takes care of case-mismatch in hoco, provider and dba names.
+ current URL pattern is just for convenience, no special meaning. After integration, those parameters should be embedded into the page

### Demo URL:

##### http://xqin1.github.com/providertree/hocotree.html?hoco/{hocoName}/state/{stateFips}

+ For Verizon, [nationwide](http://xqin1.github.com/providertree/hocotree.html?hoco/Verizon%20Communications%20Inc./state/all) 
+ For Time Warner in [CA](http://xqin1.github.com/providertree/hocotree.html?hoco/Time%20Warner%20Cable%20Inc./state/06)
+ Mouse over the DBA node to reveal more detail

### Credits Due: this app is inspired by

+ [Mike Bostock's demo](http://mbostock.github.io/d3/talk/20111018/tree.html)
+ [Pixel-in-Gene's blog post](http://blog.pixelingene.com/2011/08/progressive-reveal-animations-in-svg-using-a-svgclippath/)



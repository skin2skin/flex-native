# flex-native
English | [简体中文](./README-zh_CN.md)
### 🔗 Content list
- [Background](#background)

- [Environment Support](#-environment-support)

- [Installation](#-installation)

- [Usage](#-usage)

- [Contributor](#-contributor)

### Background
- Because most of the previously written projects use flex layout, and when they arrive at a new company, they start to make IE9 compatible, while flex layout only supports ie10 +, so it's not so convenient to implement a middle layout in IE9. Although it can also be implemented with other layouts, it's not so skilled, and the development efficiency is reduced

- I found a lot of libraries on the Internet about using flex layout in IE9, but almost all of them were not ideal, so I wanted to realize a library supporting flex box layout by myself


### 🖥 Environment Support
 - Modern browser and IE9+

| [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/edge/edge_48x48.png" alt="IE / Edge" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)<br>IE / Edge | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/firefox/firefox_48x48.png" alt="Firefox" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)<br>Firefox | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/chrome/chrome_48x48.png" alt="Chrome" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)<br>Chrome | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/safari/safari_48x48.png" alt="Safari" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)<br>Safari |
| --- | --- | --- | --- |
| IE9+, Edge | 3.5+ | all | all |

 Since the transform attribute is used to calculate the location, any browser that supports the transform attribute supports it
### 📦 Installation
```bash
npm install flex-native
```
### 🔨 Usage
- Use in normal HTML
```javascript
<script src='./flex-native.min.js'>;
```
- Use in module
```javascript
import('flex-native');
```
- css
	<br>
	.wrapper{     
		display:flex;
		align-items:center;
		justify-content:center;
		<br>
		}
- inline
	<br>
	&lt;div style='display:flex;align-items:center&gt;
	<br>
	
Generally speaking, it's no different from writing CSS

### 🤝 Contributor
[@robertpanvip](https://github.com/robertpanvip)
<br>
[@1844877065](https://github.com/1844877065)
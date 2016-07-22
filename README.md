# HTZ STICK

A flexible module for performant sticking of elements on scroll


### Installation
```bash
jspm install htz-stick=github:haaretz/htz-stick
```

### Usage
To initialize an instance:

```js
import stick from 'htz-stick';

const stickyElem = stick(document.getElementById('foo'));
```

#### Parameters
| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `target`&emsp; | `HTMLElement`&emsp; | -&emsp; | The element to make sticky. Should be contained inside an element which will keep its size and remain static |
| `options`&emsp; | `Object`&emsp; | -&emsp; | An options object |
| `options.stickyClass`&emsp; | `String`&emsp; | `'is-sticky'`&emsp; | The class that will be attached to target when it becomes sticky |
| `options.guardHeight`&emsp; | `Boolean`&emsp; | `true`&emsp; | Should `target` be wrapped by an element with an explicit height to prevent layout collapsing when `target` becomes `position: fixed` |
| `options.stickWithin`&emsp; | `HTMLElement`&emsp; | -&emsp; | Limit sticky behavior to the boundaries of the `stickWithin` element. Default's to the stuck element's parent-parent element |
| `options.topSpacing`&emsp; | `Integer` or `HTMLElement`&emsp; | `0`&emsp; | Determines how far from the top of the screen the element will stick. If `topSpacing` is an `HTMLElement`, the element's height will be calculated and used |
| `options.stickAfter`&emsp; | `HTMLElement`&emsp; | -&emsp; | Only make `elem` sticky after `stickAfter` reaches sticking position |
| `options.delta`&emsp; | `Integer`&emsp; | `0`&emsp; | Only stick if scroll delta exceeds provided amount.
| `options.direction`&emsp; | `String`&emsp; | `'both'`&emsp; | Only stick when scrolling in indicated direction. Can be one of `'both'`, `'up'` or '`down`' |
| `options.secondaryAction`&emsp; | `Function`&emsp; | -&emsp;  | A custom callback to run whenever evaluating the scroll event |

#### Events
See [documentation](https://haaretz.github.io/module-htz-stick.html#event:stick:after-destroy) for a detailed list of custom events fired.

#### Instance Methods
The following methods are available in every instance returned by `htz-stick`:

| Method | Description |
| --- | --- |
| `target`&emsp; | The target element |
| `isSticky`&emsp; | Returns `true` if `target` is currently sticky, `false` otherwise |
| `destroy`&emsp; | Remove all classes, style and event listeners associated with an instance |
| `init`&emsp; | Reinitialize an instance |

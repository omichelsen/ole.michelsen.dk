---
title: TypeScript React components recipes and tips
description: ""
date: 2018-02-18
tags:
  - archive
# tags: ["react", "typescript", "component"]
---

I recently converted a few React sites to TypeScript. Writing components in TypeScript is pretty identical to doing it in "normal" JavaScript, but there are a few concepts that are good to learn. For example you don't need `prop-types` any more, this is now handled by TypeScript interfaces.

<!-- more-->


## React.Component

Writing a regular component, that extends the `React.Component` class now looks like this:

```js
interface HelloProps {
  name: string;
}

interface HelloState {
  greeting: string;
}

class Hello extends React.Component<HelloProps, HelloState> {
  state = {
    greeting: 'Welcome to React with TypeScript'
  };

  handleChange = (event) => {
    this.setState({ greeting: event.value });
  };

  render() {
    return (
      <div>
        <div>Hello {this.props.name}!</div>
        <input value={this.state.greeting} onChange={this.handleChange} />
      </div>
    );
  }
}
```

And if you don't care about state you can just use void/any: `React.Component<HelloProps, void>`. But in that case a stateless function might be better suited.


## Functional Component (FC)

I am reusing the `HelloProps` from before, but other than that very little boilerplate is necessary to make a Functional Component.

```js
const Hello = (props: HelloProps) => {
  return (
    <div>Hello {props.name}!</div>
  );
}
```

This component is just a plain function that knows nothing about React defaults. So if you want to also pass in the standard React props like `className` etc., you have to cast the function type to `React.FC`. You can see an example of this in the next section.


### Accessing context (pre 16.3)

To access the context we need to cast the function to the type `React.FC`, set the static `contextTypes` object, and then just access the second function parameter.

```js
interface HelloContext {
  formatDate: (s: string) => string;
}

const Hello: React.FC<HelloProps> = (props: HelloProps, context: HelloContext) => {
  return (
    <div>Hello {props.name}!</div>
  );
}

Hello.contextTypes = {
  formatDate: (s) => s
}
```

Since we don't want to use the `prop-types` library any more, we are just passing in a dummy function `(s) => s`. It just has to implement the `HelloContext` interface we have described above. Think of it as "defaultProps".

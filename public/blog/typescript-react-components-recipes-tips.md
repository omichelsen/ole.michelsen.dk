I recently converted a few React sites to TypeScript. Writing components in TypeScript is pretty identical to doing it in "normal" JavaScript, but there are a few concepts that are good to learn. For example you don't need `prop-types` any more, this is now handled by TypeScript interfaces.

<!-- more-->


## React.Component

Writing a regular component, that extends the `React.Component` class now looks like this:

```js
interface IHelloProps {
  name: string;
}

interface IHelloState {
  greeting: string;
}

class Hello extends React.Component<IHelloProps, IHelloState> {
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

And if you don't care about state you can just use void/any: `React.Component<IHelloProps, void>`. But in that case a stateless function might be better suited.


## Stateless Functional Component (SFC)

I am reusing the `IHelloProps` from before, but other than that very little boilerplate is necessary to make a Stateless Functional Component (SFC).

```js
const Hello = (props: IHelloProps) => {
  return (
    <div>Hello {props.name}!</div>
  );
}
```

This component is just a plain function that knows nothing about React defaults. So if you want to also pass in the standard React props like `className` etc., you have to cast the function type to `React.SFC`. You can see an example of this in the next section.


### Accessing context (pre 16.3)

To access the context we need to cast the function to the type `React.SFC`, set the static `contextTypes` object, and then just access the second function parameter.

```js
interface IHelloContext {
  formatDate: (s: string) => string;
}

const Hello: React.SFC<IHelloProps> = (props: IHelloProps, context: IHelloContext) => {
  return (
    <div>Hello {props.name}!</div>
  );
}

Hello.contextTypes = {
  formatDate: (s) => s
}
```

Since we don't want to use the `prop-types` library any more, we are just passing in a dummy function `(s) => s`. It just has to implement the `IHelloContext` interface we have described above. Think of it as "defaultProps".

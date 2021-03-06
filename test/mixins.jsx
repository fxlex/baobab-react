/**
 * Baobab-React Mixins Unit Tests
 * ===============================
 *
 */
import assert from 'assert';
import React from 'react';
import createReactClass from 'create-react-class';
import {mount} from 'enzyme';
import Baobab from 'baobab';
import * as mixins from '../src/mixins';

/**
 * Components.
 */
const DummyRoot = createReactClass({
  mixins: [mixins.root],
  render() {
    return <div />;
  }
});

const Root = createReactClass({
  mixins: [mixins.root],
  render() {
    return <div>{this.props.children}</div>;
  }
});

/**
 * Test suite.
 */
describe('Mixins', function() {

  describe('context', function() {

    // NOTE: the commented tests do not work from React v15.2.0 & onwards

    // it('should fail if passing a wrong tree to the root mixin.', function() {

    //   assert.throws(function() {
    //     mount(<DummyRoot tree={{hello: 'world'}} />);
    //   }, /Baobab/);
    // });

    it('the tree should be propagated through context.', function() {
      const tree = new Baobab({name: 'John'}, {asynchronous: false});

      const Child = createReactClass({
        mixins: [mixins.branch],
        render() {
          return <span>Hello {this.context.tree.get('name')}</span>;
        }
      });

      const wrapper = mount(<Root tree={tree}><Child /></Root>);

      assert.strictEqual(wrapper.text(), 'Hello John');
    });

    // it('should fail if the tree is not passed through context.', function() {
    //   const Child = createReactClass({
    //     mixins: [mixins.branch],
    //     render() {
    //       return <span>Hello John</span>;
    //     }
    //   });

    //   assert.throws(function() {
    //     mount(<Child />);
    //   }, /Baobab/);
    // });
  });

  describe('binding', function() {
    it('should be possible to bind several cursors to a component.', function() {
      const tree = new Baobab({name: 'John', surname: 'Talbot'}, {asynchronous: false});

      const Child = createReactClass({
        mixins: [mixins.branch],
        cursors: {
          name: ['name'],
          surname: ['surname']
        },
        render: function() {

          return (
            <span>
              Hello {this.state.name} {this.state.surname}
            </span>
          );
        }
      });

      const wrapper = mount(<Root tree={tree}><Child /></Root>);

      assert.strictEqual(wrapper.text(), 'Hello John Talbot');
    });

    it('should be possible to register paths using typical Baobab polymorphisms.', function() {
      const tree = new Baobab({name: 'John', surname: 'Talbot'}, {asynchronous: false});

      const Child = createReactClass({
        mixins: [mixins.branch],
        cursors: {
          name: 'name',
          surname: 'surname'
        },
        render: function() {

          return (
            <span>
              Hello {this.state.name} {this.state.surname}
            </span>
          );
        }
      });

      const wrapper = mount(<Root tree={tree}><Child /></Root>);

      assert.strictEqual(wrapper.text(), 'Hello John Talbot');
    });

    it('bound components should update along with the cursor.', function(done) {
      const tree = new Baobab({name: 'John', surname: 'Talbot'}, {asynchronous: false});

      const Child = createReactClass({
        mixins: [mixins.branch],
        cursors: {
          name: ['name'],
          surname: ['surname']
        },
        render: function() {

          return (
            <span>
              Hello {this.state.name} {this.state.surname}
            </span>
          );
        }
      });

      const wrapper = mount(<Root tree={tree}><Child /></Root>);

      assert.strictEqual(wrapper.text(), 'Hello John Talbot');

      tree.set('surname', 'the Third');

      setTimeout(() => {
        assert.strictEqual(wrapper.text(), 'Hello John the Third');
        done();
      }, 50);
    });

    it('should be possible to set cursors with a function.', function(done) {
      const tree = new Baobab({name: 'John', surname: 'Talbot'}, {asynchronous: false});

      const Child = createReactClass({
        mixins: [mixins.branch],
        cursors(props) {
          return {
            name: ['name'],
            surname: props.path
          };
        },
        render: function() {

          return (
            <span>
              Hello {this.state.name} {this.state.surname}
            </span>
          );
        }
      });

      const wrapper = mount(<Root tree={tree}><Child path={['surname']} /></Root>);

      assert.strictEqual(wrapper.text(), 'Hello John Talbot');

      tree.set('surname', 'the Third');

      setTimeout(() => {
        assert.strictEqual(wrapper.text(), 'Hello John the Third');
        done();
      }, 50);
    });
  });

  describe('actions', function() {

    it('should be possible to dispatch actions.', function() {
      const tree = new Baobab({counter: 0}, {asynchronous: false});

      const inc = function(state, by = 1) {
        state.apply('counter', nb => nb + by);
      };

      const Counter = createReactClass({
        mixins: [mixins.branch],
        cursors: {
          counter: 'counter'
        },
        render() {
          const dispatch = this.dispatch;

          return (
            <span onClick={() => dispatch(inc)}
                  onChange={() => dispatch(inc, 2)}>
              Counter: {this.state.counter}
            </span>
          );
        }
      });

      const wrapper = mount(<Root tree={tree}><Counter /></Root>);

      assert.strictEqual(wrapper.text(), 'Counter: 0');
      wrapper.find('span').simulate('click');
      assert.strictEqual(wrapper.text(), 'Counter: 1');
      wrapper.find('span').simulate('change');
      assert.strictEqual(wrapper.text(), 'Counter: 3');
    });
  });
});

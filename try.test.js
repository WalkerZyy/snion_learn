const sinon = require('sinon');
const assert = require('assert');
const PubSub = require('PubSub');

function once(fn) {
    var returnValue, called = false;
    return function () {
        if (!called) {
            called = true;
            returnValue = fn.apply(this, arguments);
        }
        return returnValue;
    };
}

it('calls the original function', function () {
    var callback = sinon.fake();
    var proxy = once(callback);

    proxy();

    assert(callback.called);
});

it("should call method once with each argument", function () {
    var object = { method: function () {} };
    var spy = sinon.spy(object, "method");

    object.method(42);
    object.method(1);

    assert(spy.withArgs(42).calledOnce);
    assert(spy.withArgs(1).calledOnce);
});

it("test should call subscribers with message as first argument", function () {
    var message = 'an example message';
    var spy = sinon.spy();

    var pubsub = new PubSub();
    pubsub.subscribe(message, spy);
    const firstmsg = "some payload";
    pubsub.publishSync(message, firstmsg);

    // console.log(spy.calledWith(message)); // false
    // console.log(spy.args); //  [ [ 'some payload', { name: 'an example message', token: 0 } ] ]
    // console.log(spy.getCall(0).args[0]); // some payload

    assert.equal(firstmsg, spy.args[0][0]);
})

// 额...这段代码用的是 pubsub-js
// it("test should call all subscribers, even if there are exceptions", function(){
//     var message = 'an example message';
//     var stub = sinon.stub().throws();
//     var spy1 = sinon.spy();
//     var spy2 = sinon.spy();

//     var pubsub = new PubSub();
//     pubsub.subscribe(message, stub);
//     pubsub.subscribe(message, spy1);
//     pubsub.subscribe(message, spy2);

//     pubsub.publishSync(message, undefined);

//     assert(spy1.called);
//     assert(spy2.called);
//     assert(stub.calledBefore(spy1));
// })

it('should return correct fake values ', function() {
    const cnter = {
        num: 10,
        cnt: function(n){

            this.num += n || 1
            
            return this.num;
        },
        reset: function(){
            this.num = 0;
        }
    }
    const cnt = sinon.stub(cnter, 'cnt').callsFake(function(n){
        return 50 + ( n ||1 )
    });

    assert.equal(cnt(), 51);
    assert.equal(cnt(3), 53);
});

it('should return correct values ', function() {
    const cnter = {
        num: 10,
        cnt: function(n){

            this.num += n || 1
            
            return this.num;
        },
        reset: function(){
            this.num = 0;
        }
    }

    cnter.reset();
    assert.equal(cnter.num, 0);
    cnter.cnt( 10 );

    const _cnter = sinon.stub(cnter);

    _cnter.reset();
    assert.equal(_cnter.num, 10); // 并不会等于0，并没有this的状态？？
    // 因此stub的作用可以理解为替换目标函数
    assert.equal(cnter.num, 10);

    sinon.stub(cnter, 'num').value(20);
    assert.equal(cnter.num, 20, 'cnter.num === 20');

    cnter.reset();
    assert.equal(cnter.num, 20); // cnter被包装了之后not work了可以理解成
});

// 我想我终于get到stub是干什么用的了
it('stub replace fun ', function() {
    const cnter = {
        num: 10,
        cnt: function(n){

            this.num += n || 1
            
            return this.num;
        },
        reset: function(){
            this.num = 0;
        },
        add: function(a, b){
            return a + b;
        }
    }

    // 不能在上一个测试里面弄，因为上一个已经被wrap过了
    const stub = sinon.stub(cnter, 'add').callsFake(function(a, b){
        return 50 + a + b;
    });

    assert.equal(cnter.add(1, 2), 53);

    assert(stub.called);
});
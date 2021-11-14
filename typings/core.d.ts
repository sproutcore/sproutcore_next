import { Comparable } from "../core/mixins/comparable";
import { Copyable } from "../core/mixins/copyable";
import { Enumerable } from "../core/mixins/enumerable";
import { get } from "../core/mixins/observable";
import { clone, mixin } from "../core/system/base";
import { getSetting, setSetting } from "../core/system/settings";
import { SCString } from "../core/system/string";
import { Store } from "../datastore/datastore";


export type Fix<T> = { [K in keyof T]: T[K] };

// /**
//  * Check that any arguments to `create()` match the type's properties.
//  *
//  * Accept any additional properties and add merge them into the instance.
//  */
// type SCObjectInstanceArguments<T> = Partial<T> & {
//     [key: string]: any;
// };

// /**
//  * Accept any additional properties and add merge them into the prototype.
//  */
// interface SCObjectClassArguments {
//     [key: string]: any;
// }

// type Objectify<T> = Readonly<T>;

// type SCObjectClassConstructor<T> = (new (properties?: object) => T) & (new (...args: any[]) => T);

// type MixinOrLiteral<T, Base> = Mixin<T, Base> | T;


// // class SCObjectMethod extends Function {
// //     base: Function
// // }

// // class SCComputedProperty extends SCObjectMethod {
// //     dependentKeys: string[];
// //     cacheKey: string;
// //     lastSetValueKey: string;
// //     isProperty: true;
// // }

// // class SCCachedComputedProperty extends SCComputedProperty {
// //   
// // }

// // class SCIdempotentProperty extends SCComputedProperty {
// //     isVolatile: true;
// // }

// // class SCEnhancedMethod extends Function {
// //     isEnhancement: true;
// // }

// // class SCObserverMethod extends Function {
// //     localPropertyPaths: string[];
// //     propertyPaths: string[];
// // }


// // type SCMethod<T> = (this: T, ...args? )

interface SCObjectMethod<T> {
    base: Function
}

interface SCComputedProperty<T> {
    dependentKeys: string[];
    cacheKey: string;
    lastSetValueKey: string;
    isProperty: true;
}

interface SCCachedComputedProperty<T> extends SCComputedProperty<T> {
    isCacheable: true
}

type ComputedPropertyFunction<T> = (this: any, key: string, newVal?: T) => T;

type ObserverMethod<Target, Sender> =
    | keyof Target
    | ((this: Target, sender: Sender, key: string, value: any, rev: number) => void);


// // type MethodDetector<T, U> = 
// //     T extends Function? SCObjectMethod<T> & ThisType<U>: 
// //     (T extends SCComputedProperty<T>? SCComputedProperty<T> & ThisType<U>:
// //         (T extends SCCachedComputedProperty<T>? SCCachedComputedProperty<T> & ThisType<U>: T));
type MethodDetector<T, U> = 
    T extends Function? SCObjectMethod<T> & ThisType<U>: T;
    // unclear how to approach the computed properties atm

type DetectMethods<T> = {
    [P in keyof T]: MethodDetector<T[P], T>
}

class CoreObject {
    constructor(properties?: object);
    init(): void;
    concatenatedProperties: any[];
    isDestroyed: boolean;
    destroy: CoreObject;
    toString(): string;
    static create<Class extends typeof CoreObject>(
        this: Class
    ): InstanceType<Class>;

    static create<
        Class extends typeof CoreObject,
        T1 extends SCObjectInstanceArguments<DetectMethods<InstanceType<Class>>>
    >(
        this: Class,
        arg1: T1 & ThisType<T1 & InstanceType<Class>>
    ): InstanceType<Class> & T1;

    static create<
        Class extends typeof CoreObject,
        T1 extends SCObjectInstanceArguments<DetectMethods<InstanceType<Class>>>
        ,
        T2 extends SCObjectInstanceArguments<DetectMethods<InstanceType<Class>>>
    >(
        this: Class,
        arg1: T1 & ThisType<T1 & InstanceType<Class>>,
        arg2: T2 & ThisType<T2 & InstanceType<Class>>
    ): InstanceType<Class> & T1 & T2;

    static create<
        Class extends typeof CoreObject,
        T1 extends SCObjectInstanceArguments<
            DetectMethods<InstanceType<Class>>
        >,
        T2 extends SCObjectInstanceArguments<
            DetectMethods<InstanceType<Class>>
        >,
        T3 extends SCObjectInstanceArguments<
            DetectMethods<InstanceType<Class>>
        >
    >(
        this: Class,
        arg1: T1 & ThisType<T1 & InstanceType<Class>>,
        arg2: T2 & ThisType<T2 & InstanceType<Class>>,
        arg3: T3 & ThisType<T3 & InstanceType<Class>>
    ): InstanceType<Class> & T1 & T2 & T3;

    static extend<
        Statics,
        Instance extends B1 & B2 & B3 & B4,
        T1 extends SCObjectClassArguments,
        B1,
        T2 extends SCObjectClassArguments,
        B2,
        T3 extends SCObjectClassArguments,
        B3,
        T4 extends SCObjectClassArguments,
        B4
    >(
        this: Statics & SCObjectClassConstructor<Instance>,
        arg1: MixinOrLiteral<T1, B1> & ThisType<Fix<Instance & T1>>,
        arg2: MixinOrLiteral<T2, B2> & ThisType<Fix<Instance & T1 & T2>>,
        arg3: MixinOrLiteral<T3, B3> & ThisType<Fix<Instance & T1 & T2 & T3>>,
        arg4: MixinOrLiteral<T4, B4> &
            ThisType<Fix<Instance & T1 & T2 & T3 & T4>>
    ): Objectify<Statics> & SCObjectClassConstructor<T1 & T2 & T3 & T4 & Instance>;

    static extend<
        Statics,
        Instance extends B1 & B2 & B3,
        T1 extends SCObjectClassArguments,
        B1,
        T2 extends SCObjectClassArguments,
        B2,
        T3 extends SCObjectClassArguments,
        B3
    >(
        this: Statics & SCObjectClassConstructor<Instance>,
        arg1: MixinOrLiteral<T1, B1> & ThisType<Fix<Instance & T1>>,
        arg2: MixinOrLiteral<T2, B2> & ThisType<Fix<Instance & T1 & T2>>,
        arg3: MixinOrLiteral<T3, B3> & ThisType<Fix<Instance & T1 & T2 & T3>>
    ): Objectify<Statics> & SCObjectClassConstructor<T1 & T2 & T3 & Instance>;

    static extend<
        Statics,
        Instance extends B1 & B2,
        T1 extends SCObjectClassArguments,
        B1,
        T2 extends SCObjectClassArguments,
        B2
    >(
        this: Statics & SCObjectClassConstructor<Instance>,
        arg1: MixinOrLiteral<T1, B1> & ThisType<Fix<Instance & T1>>,
        arg2: MixinOrLiteral<T2, B2> & ThisType<Fix<Instance & T1 & T2>>
    ): Objectify<Statics> & SCObjectClassConstructor<T1 & T2 & Instance>;


    static extend<
        Statics,
        Instance extends B1,
        T1 extends SCObjectClassArguments,
        B1
    >(
        this: Statics & SCObjectClassConstructor<Instance>,
        arg1: MixinOrLiteral<T1, B1> & ThisType<Fix<Instance & T1>>
    ): Objectify<Statics> & SCObjectClassConstructor<T1 & Instance>;


    static extend<Statics, Instance>(
        this: Statics & SCObjectClassConstructor<Instance>
    ): Objectify<Statics> & SCObjectClassConstructor<Instance>;


   static reopen<
        Statics,
        Instance extends B1 & B2 & B3,
        T1 extends SCObjectClassArguments,
        B1,
        T2 extends SCObjectClassArguments,
        B2,
        T3 extends SCObjectClassArguments,
        B3
    >(
        this: Statics & SCObjectClassConstructor<Instance>,
        arg1: MixinOrLiteral<T1, B1> & ThisType<Fix<Instance & T1>>,
        arg2: MixinOrLiteral<T2, B2> & ThisType<Fix<Instance & T1 & T2>>,
        arg3: MixinOrLiteral<T3, B3> & ThisType<Fix<Instance & T1 & T2 & T3>>
    ): Objectify<Statics> & SCObjectClassConstructor<Instance & T1 & T2 & T3>;

    static reopen<
        Statics,
        Instance extends B1 & B2,
        T1 extends SCObjectClassArguments,
        B1,
        T2 extends SCObjectClassArguments,
        B2
    >(
        this: Statics & SCObjectClassConstructor<Instance>,
        arg1: MixinOrLiteral<T1, B1> & ThisType<Fix<Instance & T1>>,
        arg2: MixinOrLiteral<T2, B2> & ThisType<Fix<Instance & T1 & T2>>
    ): Objectify<Statics> & SCObjectClassConstructor<Instance & T1 & T2>;

    static reopen<
        Statics,
        Instance extends B1,
        T1 extends SCObjectClassArguments,
        B1
    >(
        this: Statics & SCObjectClassConstructor<Instance>,
        arg1: MixinOrLiteral<T1, B1> & ThisType<Fix<Instance & T1>>
    ): Objectify<Statics> & SCObjectClassConstructor<Instance & T1>;

    static reopen<Statics, Instance>(
        this: Statics & SCObjectClassConstructor<Instance>
    ): Objectify<Statics> & SCObjectClassConstructor<Instance>;

 
}

class Mixin<T, Base = SCObject> {
    /**
     * Mixin needs to have *something* on its prototype, otherwise it's treated like an empty interface.
     * It cannot be private, sadly.
     */
    __sc_mixin__: never;

    static create<T, Base = SCObject>(
        args?: MixinOrLiteral<T, Base> & ThisType<Fix<T & Base>>
    ): Mixin<T, Base>;

    static create<T1, T2, Base = SCObject>(
        arg1: MixinOrLiteral<T1, Base> & ThisType<Fix<T1 & Base>>,
        arg2: MixinOrLiteral<T2, Base> & ThisType<Fix<T2 & Base>>
    ): Mixin<T1 & T2, Base>;

    static create<T1, T2, T3, Base = SCObject>(
        arg1: MixinOrLiteral<T1, Base> & ThisType<Fix<T1 & Base>>,
        arg2: MixinOrLiteral<T2, Base> & ThisType<Fix<T2 & Base>>,
        arg3: MixinOrLiteral<T3, Base> & ThisType<Fix<T3 & Base>>
    ): Mixin<T1 & T2 & T3, Base>;

    static create<T1, T2, T3, T4, Base = SCObject>(
        arg1: MixinOrLiteral<T1, Base> & ThisType<Fix<T1 & Base>>,
        arg2: MixinOrLiteral<T2, Base> & ThisType<Fix<T2 & Base>>,
        arg3: MixinOrLiteral<T3, Base> & ThisType<Fix<T3 & Base>>,
        arg4: MixinOrLiteral<T4, Base> & ThisType<Fix<T4 & Base>>
    ): Mixin<T1 & T2 & T3 & T4, Base>;
}
  
interface Observable {
    /**
     * Retrieves the value of a property from the object.
     */
    get<K extends keyof this>(key: K): this[K];

    /**
     * Sets the provided key or path to the value.
     */
    set<K extends keyof this>(key: K, value: this[K]): this[K];
    set<T>(key: keyof this, value: T): T;

    /**
     * Convenience method to call `propertyWillChange` and `propertyDidChange` in
     * succession.
     */
    notifyPropertyChange(keyName: string): this;
    /**
     * Adds an observer on a property.
     */
    addObserver<Target>(
        key: keyof this,
        target: Target,
        method: ObserverMethod<Target, this>
    ): this;
    addObserver(key: keyof this, method: ObserverMethod<this, this>): this;
    /**
     * Remove an observer you have previously registered on this object. Pass
     * the same key, target, and method you passed to `addObserver()` and your
     * target will no longer receive notifications.
     */
    removeObserver<Target>(
        key: keyof this,
        target: Target,
        method: ObserverMethod<Target, this>
    ): this;
    removeObserver(key: keyof this, method: ObserverMethod<this, this>): this;

    /**
     * Set the value of a property to the current value plus some amount.
     */
    incrementProperty(keyName: keyof this, increment?: number): number;
    /**
     * Set the value of a property to the current value minus some amount.
     */
    decrementProperty(keyName: keyof this, decrement?: number): number;
    /**
     * Set the value of a boolean property to the opposite of its
     * current value.
     */
    toggleProperty(keyName: keyof this): boolean;


    addProbe: (key: string) => void;
    removeProbe: (key: string) => void;
    logProperty: (...propertyNames: string[]) => void;
    isObservable: true;
    automaticallyNotifiesObserversFor: (key: string) => boolean;
    get: (key: string) => any;
    set: (key: string, value: any) => Object;
    unknownProperty: (key: string, value?: any) => any;
    beginPropertyChanges: () => Observable;
    endPropertyChanges: () => Observable;
    propertyWillChange: (key: string) => Observable;
    propertyDidChange: (key: string, value?: any, _keepCache?: boolean) => Observable;
    registerDependentKey: (key: string, dependentKeys: string[]) => void;
    registerDependentKeyWithChain: (property: string, chain: object) => void;
    removeDependentKeyWithChain: (property: string, chain: object) => void;
    // addObserver: (key: string, target: object | Function, method?: string | Function, context?: object) => object;
    // removeObserver: (key: string, target: object | Function, method?: string | Function) => object;
    hasObserverFor: (key: string, target?: object | Function, method?: string | Function) => boolean;
    initObservable: () => void;
    destroyObservable: () => object;
    addObservesHandler: (observer: Function, path: string) => object;
    removeObservesHandler: (observer: Function, path: string) => object;
    observersForKey: (key: string) => any[];
    _notifyPropertyObservers: (key?: string) => void;
    bind: (toKey: string, target: object | string, method?: string | Function) => Binding;
    didChangeFor: (context: string | object, ...propertyNames: string[]) => boolean;
    setIfChanged: (key: string | object, value: any) => object;
    getPath: (path: string) => any;
    setPath: (path: string, value: any) => object;
    setPathIfChanged: (path: string, value: any) => object;
    getEach: (...propertyNames: string[]) => any[];
    // incrementProperty: (key: string, increment?: number) => number;
    // decrementProperty: (key: string, increment?: number) => number;
    // toggleProperty: (key: string, value?: any, alt?: any) => any;
    // notifyPropertyChange: (key: string, value?: any) => object;
    allPropertiesDidChange: () => object;
    propertyRevision: number;
}

declare const Observable: Mixin<Observable, CoreObject>;

export class SCObject extends CoreObject.extend(Observable) {};

export namespace SC {
    class Object extends SCObject {};
    getSetting: (name: string) => any;
    setSetting: (name: string, val: any) => any;
    LOG_BINDINGS: boolean;
    LOG_DUPLICATE_BINDINGS: boolean;
    LOG_OBSERVERS: boolean;
    String: SCString,
    Copyable,
    Comparable,
    Enumerable,
    Observable,
    get,
    clone,
    mixin
}



global {

    interface String {
        fmt(...args?: any[]): string;
        w(): Array;
        capitalize(str?: string): string;
        camelize(str?: string): string;
        decamelize(str?: string): string;
        dasherize(str?: string): string;
        mult(str?: string): string;
        loc(...args?: any[]): string;
        locMetric(): number;
        locLayout(obj): object;

        useAutodetectedLanguage: boolean;
        preferredLanguage: string;
        
    }

    interface Array extends CoreArray, Enumerable, Observable {
        copy: (deep?: boolean) => any[];
        nextObject: (index: number, previousObject?: any, context?: any) => Function;
        enumerator: () => SCEnumerator;
        sortProperty: (key: string) => any[];
        mapProperty: (key: string) => any[];
        filterProperty: (key: string, value?: any) => any[];
        groupBy: (key: string) => Array;
        findProperty: (key: string, value?: any) => any;
        everyProperty: (key: string, value?: any) => boolean;
        someProperty: (key: string, value?: any) => boolean;
        invoke: (methodName: string) => Array;
        invokeWhile: (targetValue: any, methodName: string) => any;
        toArray: () => any[];
        getEach: (key: string) => any[];
        setEach: (key: string, value: any) => any[];
    }

    interface Function {
        property: (...args?: string[]) => SCComputedProperty;
        cacheable: () => SCCachedComputedProperty<T>;
        idempotent: () => SCIdempotentProperty<T>;
        enhance: (this: Function) => SCEnhancedMethod;
        observes: (...args: string[]) => ObserverMethod;
    }
}

// export default SC;
import React, { useEffect, useState } from "react";
import Todo from "./Todo";

function App() {
    // const [text, setText] = useState("Example");

    // const [products, setProducts] = useState([]);
    // const [selectedProduct, setSelectedProduct] = useState(null);

    // useEffect(() => {
    //     fetch('https://fakestoreapi.com/products')
    //         .then(res => res.json())
    //         .then(json => setProducts(json))
    // }, []);

    // useEffect(() => {
    //     if (selectedProduct) {
    //         fetch(`https://fakestoreapi.com/products/${selectedProduct}`)
    //             .then(res => res.json())
    //             .then(json => alert(`Rating: ${json.rating.rate}`));
    //     }
    // }, [selectedProduct]);

    // const handleTextChange = (e) => setText(e.target.value);

    return (
        <div>
            <Todo />

            
            {/* <p>lorem {text}</p>
            <h1>Products</h1>
            <input type="text" onChange={handleTextChange} />
            <ul>
                {products.map((product) => {
                    return <li
                        onClick={() => setSelectedProduct(product.id)}
                        key={product.id}
                    >
                        {product.title}
                    </li>
                })}
            </ul>
            <p>
                {text} Lorem, ipsum dolor sit amet consectetur adipisicing elit. Laborum sapiente, quibusdam laudantium laboriosam, architecto repellendus labore minima accusantium magnam fugit dolor consequatur officiis pariatur! Ratione veniam suscipit architecto nulla deserunt!
            </p> */}
        </div>
    )
}

// class App extends React.Component {
//     constructor() {
//         super();
//         this.state = {
//             color: "red",
//             height: 400
//         }
//     }

//     render() {
//         return (
//             <div>
//                 <h1 style={{ color: this.state.color }}>Hello World</h1>
//                 <button
//                     onClick={() => this.setState({ color: "blue" })}
//                 >
//                     Change to blue
//                 </button>
//             </div>
//         )
//     }
// }

export default App;
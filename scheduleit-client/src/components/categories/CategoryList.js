import React from "react";
import CategoryFormModal from "./CategoryFormModal";
import "./Categories.css";

export class CategoryList extends React.Component {
  REST_API_URL = "http://localhost:9000/api/category";

  constructor(props) {
    super(props);
    this.state = {
      categories: [],
      error: null,
    };
  }

  componentDidMount() {
    fetch(this.REST_API_URL, {
      method: "get",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
      },
    }).then(async (response) => {
      const data = await response.json();
      if (response.ok) {
        this.setState({
          categories: data,
          error: null,
        });
      } else {
        this.setState({
          categories: [],
          error: data.message,
        });
      }
    });
  }

  onSubmitOfNewCategory(newCategory) {
    fetch(this.REST_API_URL, {
      method: "post",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
      },
      body: JSON.stringify(newCategory),
    }).then(async (response) => {
      const data = await response.json();

      if (response.ok) {
        let currentCategories = [...this.state.categories];
        currentCategories.push(data);
        this.setState({
          categories: currentCategories,
          error: null,
        });
      } else {
        this.setState({
          categories: this.state.categories,
          error: data.message,
        });
      }
    });
  }

  deleteCategory(id) {
    fetch(`${this.REST_API_URL}\\${id}`, {
      method: "delete",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
      },
    }).then(async (response) => {
      if (response.ok) {
        let currentCategories = [...this.state.categories];
        currentCategories = currentCategories.filter(
          (category) => category.id !== id
        );
        this.setState({
          categories: currentCategories,
          error: null,
        });
      } else {
        const data = await response.json();
        this.setState({
          categories: this.state.categories,
          error: data.message,
        });
      }
    });
  }

  render() {
    return (
      <ul className="collection with-header">
        <p>{this.state.error}</p>
        <li className="collection-header categories-header">
          <h5>Event categories</h5>
          <CategoryFormModal
            onSubmit={(newCategory) => this.onSubmitOfNewCategory(newCategory)}
          />
        </li>
        {this.state.categories.map((category) => (
          <li className="collection-item" key={category.id}>
            <div>
              {category.name}
              <button
                className="btn-flat secondary-content teal-text lighten-1"
                onClick={() => this.deleteCategory(category.id)}
              >
                <i className="material-icons">delete_forever</i>
              </button>
            </div>
          </li>
        ))}
      </ul>
    );
  }
}

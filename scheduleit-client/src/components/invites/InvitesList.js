import React from "react";

export class InvitesList extends React.Component {
  REST_API_URL = "http://localhost:9000/api/invite";

  constructor(props) {
    super(props);
    this.state = {
      invites: [],
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
          invites: data,
          error: null,
        });
      } else {
        this.setState({
          invites: [],
          error: data.message,
        });
      }
    });
  }

  acceptInvite(id) {
    this.patchInvite(id, { status: "ACCEPTED" });
  }

  declineInvite(id) {
    this.patchInvite(id, { status: "DECLINED" });
  }

  patchInvite(id, status) {
    fetch(`${this.REST_API_URL}\\${id}`, {
      method: "put",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
      },
      body: JSON.stringify(status),
    })
      .then(async (response) => {
        if (response.ok) {
          let currentInvites = [...this.state.invites];
          currentInvites = currentInvites.filter((invite) => invite.id !== id);
          this.setState({ invites: currentInvites });
        } else {
          const data = await response.json();
          this.setState({ error: data.message });
        }
      })
      .catch((error) => {
        this.setState({ error: error.message });
      });
  }

  render() {
    return (
      <div className="row">
        <div className="col s12">
          <h4>Invites for events</h4>
          <p>Clicking Accept will add this event to your calendar</p>
        </div>
        <p>{this.state.error}</p>

        {this.state.invites.map((invite) => (
          <div className="col s6" key={invite.id}>
            <div className="card">
              <div className="card-content">
                <span className="card-title">{invite.eventTitle}</span>
                <span className="valign-wrapper">
                  <i className="material-icons teal-text lighten-1">
                    date_range
                  </i>
                  {invite.eventDate}
                </span>
                <span className="valign-wrapper">
                  <i className="material-icons teal-text lighten-1">
                    access_time
                  </i>
                  {invite.eventTime}
                </span>
                <span className="valign-wrapper">
                  <i className="material-icons teal-text lighten-1">
                    location_city
                  </i>
                  {invite.eventLocation}
                </span>
                <span className="valign-wrapper">
                  <i className="material-icons teal-text lighten-1">comment</i>
                  {invite.eventComment}
                </span>
                <span className="valign-wrapper">
                  <i className="material-icons teal-text lighten-1">person</i>
                  {invite.inviter}
                </span>
              </div>
              <div className="card-action">
                <button
                  className="btn-flat teal-text lighten-1"
                  onClick={() => this.acceptInvite(invite.id)}
                >
                  Accept
                </button>
                <button
                  className="btn-flat teal-text lighten-1"
                  onClick={() => this.declineInvite(invite.id)}
                >
                  Decline
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }
}

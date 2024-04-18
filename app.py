import time

import dash
from dash import html, dcc
import dash_bootstrap_components as dbc
from dash.dependencies import Input, Output, State


## https://dash-example-index.herokuapp.com/ 
## https://github.com/plotly/dash-sample-apps/blob/main/apps/dash-chatbot/app.py 

def textbox(text, box="other"):
    style = {
        "max-width": "55%",
        "width": "max-content",
        "padding": "10px 15px",
        "border-radius": "25px",
    }

    if box == "self":
        style["margin-left"] = "auto"
        style["margin-right"] = 0

        color = "primary"
        inverse = True

    elif box == "other":
        style["margin-left"] = 0
        style["margin-right"] = "auto"

        color = "light"
        inverse = False

    else:
        raise ValueError("Incorrect option for `box`.")

    return dbc.Card(text, style=style, body=True, color=color, inverse=inverse)


conversation = html.Div(
    style={
        "width": "80%",
        "max-width": "800px",
        "height": "70vh",
        "margin": "auto",
        "overflow-y": "auto",
    },
    id="display-conversation",
)


# Define app
app = dash.Dash(__name__, external_stylesheets=[dbc.themes.BOOTSTRAP])
server = app.server


# Define Layout
# app.layout = dbc.Container(
#     fluid=True,
#     children=[
#         html.H1("Dash Chatbot (with DialoGPT)"),
#         html.Hr(),
#         dcc.Store(id="store-conversation", data=""),
#         conversation,
#         controls,
#     ],
# )

app.layout = html.Div(
    [
        html.H2(
            f"Polar Charts of U.S. Agricultural Exports, 2011",
            style={"textAlign": "center"},
        ),
        html.Div("Choose the radius scale:"),
        dcc.RadioItems(
            id="bar-polar-app-x-radio-items",
            options=["Absolute", "Logarithmic"],
            value="Logarithmic",
        ),
        html.Br(),
        html.Div("Choose States:"),
        # dcc.Dropdown(
        #     id="bar-polar-app-x-dropdown",
        #     value=state_list[:6],
        #     options=state_list,
        #     multi=True,
        # ),
        dcc.Graph(id="bar-polar-app-x-graph"),
    ],
    style={"margin": "1em 5em", "fontSize": 18},
)


if __name__ == "__main__":
    app.run_server(debug=True)
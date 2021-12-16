from flask import Flask, render_template, request
from flask_socketio import SocketIO, emit  
from flask import jsonify
import socket
import time
import json
 
app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'                                            
socketio = SocketIO(app)     

@socketio.on('connect')                                                         
def connect():                                                                  
    emit('message', {'connected': "Hello from the server."})    

@socketio.on('client_message')
def client_message (message):
    m = json.dumps(message, sort_keys = True, indent = 4, separators = (',', ': '))
    print(f"{m}\n")

    emit('message', message, broadcast=True)

def getip ():
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        # doesn't even have to be reachable
        s.connect(('10.255.255.255', 1))
        IP = s.getsockname()[0]
    except Exception:
        IP = '127.0.0.1'
    finally:
        s.close()
    return IP

def checkPost (request, data):
    return request.get_data() == data

@app.route("/")
def index ():
    return render_template("index.html")

@app.route('/messages', methods=['POST', 'GET'])
def stuff ():
    if request.method == 'POST':
        print(request.get_data()) 

    return render_template("index.html")

if __name__ == '__main__':
    print(f"\nOn your phone go to http://{getip()}:8080\n")
    socketio.run(app, host="192.168.1.50", port=8080, debug=True)

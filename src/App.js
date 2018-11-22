import React from 'react';
import * as tf from '@tensorflow/tfjs';
import {Cell, FormLayout, Group, InfoRow, Input, List, Panel, PanelHeader, View} from '@vkontakte/vkui';
import '@vkontakte/vkui/dist/vkui.css';

import * as vc from './vocab.json';

const ROUND = 1000;

class App extends React.Component {
    constructor() {
        super();

        this.loadModel();

        this.state = {
            data: [
                0, //toxic
                0, //severe toxic
                0, //obscene
                0, //threat
                0, //insult
                0  //identity hate
            ],
        };

        this.loadModel = this.loadModel.bind(this);
        this.changeText = this.changeText.bind(this);
        this.calculate = this.calculate.bind(this);


        this.loadModel();

    }

    async calculate(text) {
        let data = [
            0, //toxic
            0, //severe toxic
            0, //obscene
            0, //threat
            0, //insult
            0  //identity hate
        ];

        if (text && this.state.model) {
            let tensorBuffer = tf.zeros([1, 100]).buffer();

            let parts = text.split(' ');
            let tIndex = 0;
            parts.forEach(function (value) {
                if (vc.hasOwnProperty(value)) {
                    tensorBuffer.set(vc[value], 0, tIndex);
                    tIndex++;
                }
            });

            data = await this.state.model.predict(tensorBuffer.toTensor()).data();

        }

        this.setState({data: data});

    }

    changeText(e) {
        this.calculate(e.target.value);
    }

    async loadModel() {
        let loadedModel = await tf.loadModel('/model.json');
        this.setState({model: loadedModel});
    }

    renderScore(score) {
        return (Math.round(score * 1000) / 10)  + '%';
    }

    renderEmoji(score) {
        if (score >= 0.9) {
            return '🤬';
        } else if (score >= 0.5) {
            return '😡';
        } else if (score >= 0.2) {
            return '🤭';
        } else {
            return '😀'
        }
    }

    render() {
        return (
            <View activePanel="mainPanel">
                <Panel id="mainPanel">
                    <PanelHeader>Toxic detector</PanelHeader>
                    <Group>
                        <FormLayout>
                            <Input type="text" top="Your text" onChange={this.changeText}/>
                        </FormLayout>
                    </Group>

                    <Group title="Results">
                        <List>
                            <Cell>
                                <InfoRow title="Toxic">
                                    {this.renderScore(this.state.data[0])} {this.renderEmoji(this.state.data[0])}
                                </InfoRow>
                            </Cell>
                            <Cell>
                                <InfoRow title="Severe Toxic">
                                    {this.renderScore(this.state.data[1])} {this.renderEmoji(this.state.data[1])}
                                </InfoRow>
                            </Cell>
                            <Cell>
                                <InfoRow title="Obscene">
                                    {this.renderScore(this.state.data[2])} {this.renderEmoji(this.state.data[2])}
                                </InfoRow>
                            </Cell>
                            <Cell>
                                <InfoRow title="Threat">
                                    {this.renderScore(this.state.data[3])} {this.renderEmoji(this.state.data[3])}
                                </InfoRow>
                            </Cell>
                            <Cell>
                                <InfoRow title="Insult">
                                    {this.renderScore(this.state.data[4])} {this.renderEmoji(this.state.data[4])}
                                </InfoRow>
                            </Cell>
                            <Cell>
                                <InfoRow title="Identity Hate">
                                    {this.renderScore(this.state.data[5])} {this.renderEmoji(this.state.data[5])}
                                </InfoRow>
                            </Cell>
                        </List>
                    </Group>
                </Panel>
            </View>
        );
    }
}

export default App;

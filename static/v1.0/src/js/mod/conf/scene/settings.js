/**********************************************************
 * Copyright (c) SESHENGHUO.COM All rights reserved       *
 **********************************************************/

/**
 * 场景配置
 * @charset utf-8
 * @author lijun
 * @git: https://github.com/zwlijun/se.lib
 * @date 2015.9
 */
;define(function (require, exports, module){
    var SCREEN_ANIMATE = window["SCREEN_ANIMATE"] = {
        "Types": {
            "SCREEN": "screen",
            "SCALE": "scale",
            "DRAW": "draw",
            "FADE": "fade",
            "CIRCLE": "circle",
            "ROTATE": "rotate",
            "PUSH": "push",
            "SCREWING": "screwing"
        },
        "MODE": {
            "X": "x",
            "Y": "y"
        },
        "DIR": {
            "UP": "up",
            "DOWN": "down"
        },
        "ACTION": {
            "IN": "in",
            "OUT": "out"
        }
    };

    var DEFAULT_ANIMATION_PROPERTIES = {
        "duration": "1s", 
        "timing-function": "ease", 
        "delay": "0s", 
        "direction": "normal", 
        "iteration-count": "1", 
        "fill-mode": "both", 
        "play-state": "running"
    };  

    var KEY_FRAMES = {
        "screen": {
            "y": {
                "in": {
                    "up": {
                        "from": {
                            "opacity": "1",
                            "transform": "translate(0%,100%) translateZ(0)"
                        },
                        "to": {
                            "opacity": "1",
                            "transform": "translate(0%,0%) translateZ(0)"
                        }
                    },
                    "down": {
                        "from": {
                            "opacity": "1",
                            "transform": "translate(0%,-100%) translateZ(0)"
                        },
                        "to": {
                            "opacity": "1",
                            "transform": "translate(0%,0%) translateZ(0)"
                        }
                    }
                },
                "out": {
                    "up": {
                        "from": {
                            "opacity": "1",
                            "transform": "translate(0%,0%) translateZ(0)"
                        },
                        "to": {
                            "opacity": "1",
                            "transform": "translate(0%,-100%) translateZ(0)"
                        }
                    },
                    "down": {
                        "from": {
                            "opacity": "1",
                            "transform": "translate(0%,0%) translateZ(0)"
                        },
                        "to": {
                            "opacity": "1",
                            "transform": "translate(0%,100%) translateZ(0)"
                        }
                    }
                }
            },
            "x": {
                "in": {
                    "up": {
                        "from": {
                            "opacity": "1",
                            "transform": "translate(100%,0%) translateZ(0)"
                        },
                        "to": {
                            "opacity": "1",
                            "transform": "translate(0%,0%) translateZ(0)"
                        }
                    },
                    "down": {
                        "from": {
                            "opacity": "1",
                            "transform": "translate(-100%,0%) translateZ(0)"
                        },
                        "to": {
                            "opacity": "1",
                            "transform": "translate(0%,0%) translateZ(0)"
                        }
                    }
                },
                "out": {
                    "up": {
                        "from": {
                            "opacity": "1",
                            "transform": "translate(0%,0%) translateZ(0)"
                        },
                        "to": {
                            "opacity": "1",
                            "transform": "translate(-100%,0%) translateZ(0)"
                        }
                    },
                    "down": {
                        "from": {
                            "opacity": "1",
                            "transform": "translate(0%,0%) translateZ(0)"
                        },
                        "to": {
                            "opacity": "1",
                            "transform": "translate(100%,0%) translateZ(0)"
                        }
                    }
                }
            }
        },
        "scale": {
            "y": {
                "in": {
                    "up": {
                        "from": {
                            "opacity": "0",
                            "transform-origin": "50% 100% 0",
                            "transform": "scale(0.3)"
                        },
                        "to": {
                            "opacity": "1",
                            "transform-origin": "50% 100% 0",
                            "transform": "scale(1.0)"
                        }
                    },
                    "down": {
                        "from": {
                            "opacity": "0",
                            "transform-origin": "50% 0% 0",
                            "transform": "scale(0.3)"
                        },
                        "to": {
                            "opacity": "1",
                            "transform-origin": "50% 0% 0",
                            "transform": "scale(1.0)"
                        }
                    }
                },
                "out": {
                    "up": {
                        "0%": {
                            "opacity": "1",
                            "transform-origin": "50% 0% 0",
                            "transform": "scale(1.0)"
                        },
                        "100%": {
                            "opacity": "0",
                            "transform-origin": "50% 0% 0",
                            "transform": "scale(0.3)"
                        }
                    },
                    "down": {
                        "0%": {
                            "opacity": "1",
                            "transform-origin": "50% 100% 0",
                            "transform": "scale(1.0)"
                        },
                        "100%": {
                            "opacity": "0",
                            "transform-origin": "50% 100% 0",
                            "transform": "scale(0.3)"
                        }
                    }
                }
            },
            "x": {
                "in": {
                    "up": {
                        "from": {
                            "opacity": "0",
                            "transform-origin": "100% 50% 0",
                            "transform": "scale(0.3)"
                        },
                        "to": {
                            "opacity": "1",
                            "transform-origin": "100% 50% 0",
                            "transform": "scale(1.0)"
                        }
                    },
                    "down": {
                        "from": {
                            "opacity": "0",
                            "transform-origin": "0% 50% 0",
                            "transform": "scale(0.3)"
                        },
                        "to": {
                            "opacity": "1",
                            "transform-origin": "0% 50% 0",
                            "transform": "scale(1.0)"
                        }
                    }
                },
                "out": {
                    "up": {
                        "0%": {
                            "opacity": "1",
                            "transform-origin": "0% 50% 0",
                            "transform": "scale(1.0)"
                        },
                        "100%": {
                            "opacity": "0",
                            "transform-origin": "0% 50% 0",
                            "transform": "scale(0.3)"
                        }
                    },
                    "down": {
                        "0%": {
                            "opacity": "1",
                            "transform-origin": "100% 50% 0",
                            "transform": "scale(1.0)"
                        },
                        "100%": {
                            "opacity": "0",
                            "transform-origin": "100% 50% 0",
                            "transform": "scale(0.3)"
                        }
                    }
                }
            }
        },
        "draw": {
            "y": {
                "in": {
                    "up": {
                        "from": {
                            "opacity": "0",
                            "transform": "translate(0%,100%) translateZ(0)"
                        },
                        "to": {
                            "opacity": "1",
                            "transform": "translate(0%,0%) translateZ(0)"
                        }
                    },
                    "down": {
                        "from": {
                            "opacity": "0",
                            "transform": "translate(0%,-100%) translateZ(0)"
                        },
                        "to": {
                            "opacity": "1",
                            "transform": "translate(0%,0%) translateZ(0)"
                        }
                    }
                },
                "out": {
                    "up": {
                        "from": {
                            "opacity": "1",
                            "transform": "translate(0%,0%) translateZ(0)"
                        },
                        "to": {
                            "opacity": "1",
                            "transform": "translate(0%,0%) translateZ(0)"
                        }
                    },
                    "down": {
                        "from": {
                            "opacity": "1",
                            "transform": "translate(0%,0%) translateZ(0)"
                        },
                        "to": {
                            "opacity": "1",
                            "transform": "translate(0%,0%) translateZ(0)"
                        }
                    }
                }
            },
            "x": {
                "in": {
                    "up": {
                        "from": {
                            "opacity": "0",
                            "transform": "translate(100%,0%) translateZ(0)"
                        },
                        "to": {
                            "opacity": "1",
                            "transform": "translate(0%,0%) translateZ(0)"
                        }
                    },
                    "down": {
                        "from": {
                            "opacity": "0",
                            "transform": "translate(-100%,0%) translateZ(0)"
                        },
                        "to": {
                            "opacity": "1",
                            "transform": "translate(0%,0%) translateZ(0)"
                        }
                    }
                },
                "out": {
                    "up": {
                        "from": {
                            "opacity": "1",
                            "transform": "translate(0%,0%) translateZ(0)"
                        },
                        "to": {
                            "opacity": "1",
                            "transform": "translate(0%,0%) translateZ(0)"
                        }
                    },
                    "down": {
                        "from": {
                            "opacity": "1",
                            "transform": "translate(0%,0%) translateZ(0)"
                        },
                        "to": {
                            "opacity": "1",
                            "transform": "translate(0%,0%) translateZ(0)"
                        }
                    }
                }
            }
        },
        "fade": {
            "y": {
                "in": {
                    "up": {
                        "from": {
                            "opacity": "0",
                            "transform": "translate(0%,0%) translateZ(0)"
                        },
                        "to": {
                            "opacity": "1",
                            "transform": "translate(0%,0%) translateZ(0)"
                        }
                    },
                    "down": {
                        "from": {
                            "opacity": "0",
                            "transform": "translate(0%,0%) translateZ(0)"
                        },
                        "to": {
                            "opacity": "1",
                            "transform": "translate(0%,0%) translateZ(0)"
                        }
                    }
                },
                "out": {
                    "up": {
                        "from": {
                            "opacity": "1",
                            "transform": "translate(0%,0%) translateZ(0)"
                        },
                        "to": {
                            "opacity": "0",
                            "transform": "translate(0%,0%) translateZ(0)"
                        }
                    },
                    "down": {
                        "from": {
                            "opacity": "1",
                            "transform": "translate(0%,0%) translateZ(0)"
                        },
                        "to": {
                            "opacity": "0",
                            "transform": "translate(0%,0%) translateZ(0)"
                        }
                    }
                }
            },
            "x": {
                "in": {
                    "up": {
                        "from": {
                            "opacity": "0",
                            "transform": "translate(0%,0%) translateZ(0)"
                        },
                        "to": {
                            "opacity": "1",
                            "transform": "translate(0%,0%) translateZ(0)"
                        }
                    },
                    "down": {
                        "from": {
                            "opacity": "0",
                            "transform": "translate(0%,0%) translateZ(0)"
                        },
                        "to": {
                            "opacity": "1",
                            "transform": "translate(0%,0%) translateZ(0)"
                        }
                    }
                },
                "out": {
                    "up": {
                        "from": {
                            "opacity": "1",
                            "transform": "translate(0%,0%) translateZ(0)"
                        },
                        "to": {
                            "opacity": "0",
                            "transform": "translate(0%,0%) translateZ(0)"
                        }
                    },
                    "down": {
                        "from": {
                            "opacity": "1",
                            "transform": "translate(0%,0%) translateZ(0)"
                        },
                        "to": {
                            "opacity": "0",
                            "transform": "translate(0%,0%) translateZ(0)"
                        }
                    }
                }
            }
        },
        "circle": {
            "y": {
                "extra": {
                    "self": {
                        "transform-origin": "50% 100% 0"
                    }
                },
                "in": {
                    "up": {
                        "from": {
                            "opacity": "1",
                            "transform": "translate(0%,0%) translateZ(0) rotate(180deg)"
                        },
                        "to": {
                            "opacity": "1",
                            "transform": "translate(0%,0%) translateZ(0) rotate(360deg)"
                        }
                    },
                    "down": {
                        "from": {
                            "opacity": "1",
                            "transform": "translate(0%,0%) translateZ(0) rotate(-180deg)"
                        },
                        "to": {
                            "opacity": "1",
                            "transform": "translate(0%,0%) translateZ(0) rotate(-360deg)"
                        }
                    }
                },
                "out": {
                    "up": {
                        "from": {
                            "opacity": "1",
                            "transform": "translate(0%,0%) translateZ(0) rotate(0deg)"
                        },
                        "to": {
                            "opacity": "1",
                            "transform": "translate(0%,0%) translateZ(0) rotate(180deg)"
                        }
                    },
                    "down": {
                        "from": {
                            "opacity": "1",
                            "transform": "translate(0%,0%) translateZ(0) rotate(0deg)"
                        },
                        "to": {
                            "opacity": "1",
                            "transform": "translate(0%,0%) translateZ(0) rotate(-180deg)"
                        }
                    }
                }
            },
            "x": {
                "extra": {
                    "self": {
                        "transform-origin": "50% 100% 0"
                    }
                },
                "in": {
                    "up": {
                        "from": {
                            "opacity": "1",
                            "transform": "translate(0%,0%) translateZ(0) rotate(180deg)"
                        },
                        "to": {
                            "opacity": "1",
                            "transform": "translate(0%,0%) translateZ(0) rotate(360deg)"
                        }
                    },
                    "down": {
                        "from": {
                            "opacity": "1",
                            "transform": "translate(0%,0%) translateZ(0) rotate(-180deg)"
                        },
                        "to": {
                            "opacity": "1",
                            "transform": "translate(0%,0%) translateZ(0) rotate(-360deg)"
                        }
                    }
                },
                "out": {
                    "up": {
                        "from": {
                            "opacity": "1",
                            "transform": "translate(0%,0%) translateZ(0) rotate(0deg)"
                        },
                        "to": {
                            "opacity": "1",
                            "transform": "translate(0%,0%) translateZ(0) rotate(180deg)"
                        }
                    },
                    "down": {
                        "from": {
                            "opacity": "1",
                            "transform": "translate(0%,0%) translateZ(0) rotate(0deg)"
                        },
                        "to": {
                            "opacity": "1",
                            "transform": "translate(0%,0%) translateZ(0) rotate(-180deg)"
                        }
                    }
                }
            }
        },
        "rotate": {
            "y": {
                "extra": {
                    "self": {
                        "transform-origin": "50% 100% 0"
                    },
                    "parent": {
                        "perspective": "800px"
                    }
                },
                "in": {
                    "up": {
                        "from": {
                            "opacity": "0",
                            "transform": "translate(0%,0%) translateZ(0) rotateX(-60deg) rotateY(0deg)"
                        },
                        "to": {
                            "opacity": "1",
                            "transform": "translate(0%,0%) translateZ(0) rotateX(-0deg) rotateY(0deg)"
                        }
                    },
                    "down": {
                        "from": {
                            "opacity": "0",
                            "transform": "translate(0%,0%) translateZ(0) rotateX(60deg) rotateY(0deg)"
                        },
                        "to": {
                            "opacity": "1",
                            "transform": "translate(0%,0%) translateZ(0) rotateX(0deg) rotateY(0deg)"
                        }
                    }
                },
                "out": {
                    "up": {
                        "from": {
                            "opacity": "1",
                            "transform": "translate(0%,0%) translateZ(0) rotateX(0deg) rotateY(0deg)"
                        },
                        "to": {
                            "opacity": "0",
                            "transform": "translate(0%,0%) translateZ(0) rotateX(60deg) rotateY(0deg)"
                        }
                    },
                    "down": {
                        "from": {
                            "opacity": "1",
                            "transform": "translate(0%,0%) translateZ(0) rotateX(0deg) rotateY(0deg)"
                        },
                        "to": {
                            "opacity": "0",
                            "transform": "translate(0%,0%) translateZ(0) rotateX(-60deg) rotateY(0deg)"
                        }
                    }
                }
            },
            "x": {
                "extra": {
                    "self": {
                        "transform-origin": "0% 50% 0"
                    },
                    "parent": {
                        "perspective": "800px"
                    }
                },
                "in": {
                    "up": {
                        "from": {
                            "opacity": "0",
                            "transform": "translate(0%,0%) translateZ(0) rotateX(0deg) rotateY(-60deg)"
                        },
                        "to": {
                            "opacity": "1",
                            "transform": "translate(0%,0%) translateZ(0) rotateX(0deg) rotateY(-0deg)"
                        }
                    },
                    "down": {
                        "from": {
                            "opacity": "0",
                            "transform": "translate(0%,0%) translateZ(0) rotateX(0deg) rotateY(60deg)"
                        },
                        "to": {
                            "opacity": "1",
                            "transform": "translate(0%,0%) translateZ(0) rotateX(0deg) rotateY(0deg)"
                        }
                    }
                },
                "out": {
                    "up": {
                        "from": {
                            "opacity": "1",
                            "transform": "translate(0%,0%) translateZ(0) rotateX(0deg) rotateY(0deg)"
                        },
                        "to": {
                            "opacity": "0",
                            "transform": "translate(0%,0%) translateZ(0) rotateX(0deg) rotateY(60deg)"
                        }
                    },
                    "down": {
                        "from": {
                            "opacity": "1",
                            "transform": "translate(0%,0%) translateZ(0) rotateX(0deg) rotateY(0deg)"
                        },
                        "to": {
                            "opacity": "0",
                            "transform": "translate(0%,0%) translateZ(0) rotateX(0deg) rotateY(-60deg)"
                        }
                    }
                }
            }
        },
        "push": {
            "y": {
                "in": {
                    "up": {
                        "from": {
                            "opacity": "1",
                            "transform-origin": "0% 100%",
                            "transform": "scaleY(0)"
                        },
                        "to": {
                            "opacity": "1",
                            "transform-origin": "0% 100%",
                            "transform": "scaleY(1)"
                        }
                    },
                    "down": {
                        "from": {
                            "opacity": "1",
                            "transform-origin": "0% 0%",
                            "transform": "scaleY(0)"
                        },
                        "to": {
                            "opacity": "1",
                            "transform-origin": "0% 0%",
                            "transform": "scaleY(1)"
                        }
                    }
                },
                "out": {
                    "up": {
                        "from": {
                            "opacity": "1",
                            "transform-origin": "0% 0%",
                            "transform": "scaleY(1)"
                        },
                        "to": {
                            "opacity": "1",
                            "transform-origin": "0% 0%",
                            "transform": "scaleY(0)"
                        }
                    },
                    "down": {
                        "from": {
                            "opacity": "1",
                            "transform-origin": "0% 100%",
                            "transform": "scaleY(1)"
                        },
                        "to": {
                            "opacity": "1",
                            "transform-origin": "0% 100%",
                            "transform": "scaleY(0)"
                        }
                    }
                }
            },
            "x": {
                "in": {
                    "up": {
                        "from": {
                            "opacity": "1",
                            "transform-origin": "100% 0%",
                            "transform": "scaleX(0)"
                        },
                        "to": {
                            "opacity": "1",
                            "transform-origin": "100% 0%",
                            "transform": "scaleX(1)"
                        }
                    },
                    "down": {
                        "from": {
                            "opacity": "1",
                            "transform-origin": "0% 0%",
                            "transform": "scaleX(0)"
                        },
                        "to": {
                            "opacity": "1",
                            "transform-origin": "0% 0%",
                            "transform": "scaleX(1)"
                        }
                    }
                },
                "out": {
                    "up": {
                        "from": {
                            "opacity": "1",
                            "transform-origin": "0% 0%",
                            "transform": "scaleX(1)"
                        },
                        "to": {
                            "opacity": "1",
                            "transform-origin": "0% 0%",
                            "transform": "scaleX(0)"
                        }
                    },
                    "down": {
                        "from": {
                            "opacity": "1",
                            "transform-origin": "100% 0%",
                            "transform": "scaleX(1)"
                        },
                        "to": {
                            "opacity": "1",
                            "transform-origin": "100% 0%",
                            "transform": "scaleX(0)"
                        }
                    }
                }
            }
        },
        "screwing": {
            "y": {
                "in": {
                    "up": {
                        "from": {
                            "opacity": "0",
                            "transform-origin": "left bottom 0",
                            "transform": "translate(0%,0%) translateZ(0) rotate(90deg)"
                        },
                        "to": {
                            "opacity": "1",
                            "transform-origin": "left bottom 0",
                            "transform": "translate(0%,0%) translateZ(0) rotate(0deg)"
                        }
                    },
                    "down": {
                        "from": {
                            "opacity": "0",
                            "transform-origin": "left top 0",
                            "transform": "translate(0%,0%) translateZ(0) rotate(-90deg)"
                        },
                        "to": {
                            "opacity": "1",
                            "transform-origin": "left top 0",
                            "transform": "translate(0%,0%) translateZ(0) rotate(0deg)"
                        }
                    }
                },
                "out": {
                    "up": {
                        "from": {
                            "opacity": "1",
                            "transform-origin": "left top 0",
                            "transform": "translate(0%,0%) translateZ(0) rotate(0deg)"
                        },
                        "to": {
                            "opacity": "0",
                            "transform-origin": "left top 0",
                            "transform": "translate(0%,0%) translateZ(0) rotate(-90deg)"
                        }
                    },
                    "down": {
                        "from": {
                            "opacity": "1",
                            "transform-origin": "left bottom 0",
                            "transform": "translate(0%,0%) translateZ(0) rotate(0deg)"
                        },
                        "to": {
                            "opacity": "0",
                            "transform-origin": "left bottom 0",
                            "transform": "translate(0%,0%) translateZ(0) rotate(90deg)"
                        }
                    }
                }
            },
            "x": {
                "in": {
                    "up": {
                        "from": {
                            "opacity": "0",
                            "transform-origin": "right top 0",
                            "transform": "translate(0%,0%) translateZ(0) rotate(-90deg)"
                        },
                        "to": {
                            "opacity": "1",
                            "transform-origin": "right top 0",
                            "transform": "translate(0%,0%) translateZ(0) rotate(0deg)"
                        }
                    },
                    "down": {
                        "from": {
                            "opacity": "0",
                            "transform-origin": "left top 0",
                            "transform": "translate(0%,0%) translateZ(0) rotate(90deg)"
                        },
                        "to": {
                            "opacity": "1",
                            "transform-origin": "left top 0",
                            "transform": "translate(0%,0%) translateZ(0) rotate(0deg)"
                        }
                    }
                },
                "out": {
                    "up": {
                        "from": {
                            "opacity": "1",
                            "transform-origin": "left top 0",
                            "transform": "translate(0%,0%) translateZ(0) rotate(0deg)"
                        },
                        "to": {
                            "opacity": "0",
                            "transform-origin": "left top 0",
                            "transform": "translate(0%,0%) translateZ(0) rotate(90deg)"
                        }
                    },
                    "down": {
                        "from": {
                            "opacity": "1",
                            "transform-origin": "right top 0",
                            "transform": "translate(0%,0%) translateZ(0) rotate(0deg)"
                        },
                        "to": {
                            "opacity": "0",
                            "transform-origin": "right top 0",
                            "transform": "translate(0%,0%) translateZ(0) rotate(-90deg)"
                        }
                    }
                }
            }
        }
    };


    module.exports = {
        "version": "R15B1112",
        "SCREEN_ANIMATE": SCREEN_ANIMATE,
        "DEFAULT_ANIMATION_PROPERTIES": DEFAULT_ANIMATION_PROPERTIES,
        "KEY_FRAMES": KEY_FRAMES
    };
});